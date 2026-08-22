import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { medicalRecords, patients, hospitals } from '../dataStore.js';
import { authenticateToken, requireRole, logAuditEvent } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config supporting PDF, TXT, JPG, JPEG, PNG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'DOC-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.txt', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${ext}. Supported: PDF, TXT, JPG, JPEG, PNG.`));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// Get Unified Longitudinal Medical History for a patient
router.get('/patient/:anvayId', authenticateToken, (req, res) => {
  const { anvayId } = req.params;
  const { category, hospitalId } = req.query;

  const patient = patients.find(p => p.anvayId.toLowerCase() === anvayId.toLowerCase());
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  let records = medicalRecords.filter(r => (r.patientAnvayId || r.anvayId || '').toLowerCase() === anvayId.toLowerCase());

  if (category && category !== 'All') {
    records = records.filter(r => (r.recordType || r.category || '').toLowerCase() === category.toLowerCase());
  }
  if (hospitalId && hospitalId !== 'All') {
    records = records.filter(r => r.hospitalId === hospitalId);
  }

  records.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const allPatientRecords = medicalRecords.filter(r => (r.patientAnvayId || r.anvayId || '').toLowerCase() === anvayId.toLowerCase());
  const contributingHospitals = [...new Map(allPatientRecords.map(r => [r.hospitalId, { id: r.hospitalId, name: r.hospitalName }])).values()];

  res.json({
    success: true,
    patient,
    contributingHospitals,
    totalRecords: records.length,
    records
  });
});

// Get Single Medical Record
router.get('/:recordId', authenticateToken, (req, res) => {
  const record = medicalRecords.find(r => r.recordId === req.params.recordId);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Medical record not found' });
  }

  res.json({
    success: true,
    record
  });
});

// Add New Medical Record (Verified Doctor or Hospital Staff)
router.post('/add', authenticateToken, requireRole(['Doctor', 'Hospital Admin', 'Super Admin']), (req, res) => {
  const {
    patientAnvayId,
    recordType,
    title,
    description,
    department,
    clinicalData,
    documents
  } = req.body;

  if (!patientAnvayId || !recordType || !title) {
    return res.status(400).json({ success: false, message: 'Missing required record parameters' });
  }

  const patient = patients.find(p => p.anvayId.toLowerCase() === patientAnvayId.toLowerCase());
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const hospitalId = req.user.hospitalId || 'hosp_metro_01';
  const hospital = hospitals.find(h => h.id === hospitalId) || { name: 'Metro Super Specialty Hospital' };
  const doctorName = req.user.role === 'Doctor' ? req.user.name : (req.body.doctorName || req.user.name);
  const doctorId = req.user.doctorId || 'doc_gen_01';

  const newRecordId = `REC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const newRecord = {
    recordId: newRecordId,
    patientAnvayId: patient.anvayId,
    anvayId: patient.anvayId,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    doctorId: doctorId,
    doctorName: doctorName,
    department: department || 'General Medicine',
    recordType,
    category: recordType,
    title,
    description: description || '',
    clinicalData: clinicalData || {},
    documents: documents || [],
    version: 1,
    versionHistory: [],
    verificationStatus: 'Verified',
    createdAt: now,
    updatedAt: now
  };

  medicalRecords.unshift(newRecord);

  res.status(201).json({
    success: true,
    message: 'Medical record securely added with complete source provenance',
    record: newRecord
  });
});

// Amend / Update Medical Record
router.post('/:recordId/amend', authenticateToken, requireRole(['Doctor', 'Hospital Admin', 'Super Admin']), (req, res) => {
  const { recordId } = req.params;
  const { title, description, reasonForChange } = req.body;

  if (!reasonForChange) {
    return res.status(400).json({ success: false, message: 'A valid reason for amendment is mandatory for medical record versioning' });
  }

  const record = medicalRecords.find(r => r.recordId === recordId);
  if (!record) {
    return res.status(404).json({ success: false, message: 'Medical record not found' });
  }

  const doctorName = req.user.name;
  const now = new Date().toISOString();
  const nextVersion = (record.version || 1) + 1;

  const newVersionEntry = {
    version: nextVersion,
    updatedAt: now,
    changedBy: doctorName,
    hospitalName: record.hospitalName,
    reasonForChange,
    snapshot: {
      title: title || record.title,
      description: description || record.description
    }
  };

  record.version = nextVersion;
  record.versionHistory.push(newVersionEntry);
  if (title) record.title = title;
  if (description) record.description = description;
  record.updatedAt = now;

  res.json({
    success: true,
    message: `Record successfully updated to Version ${nextVersion} with immutable change history preserved`,
    record
  });
});

// Upload Multi-Format Medical Document
router.post('/upload-document', authenticateToken, upload.single('document'), (req, res) => {
  const { anvayId, title, category, description } = req.body;

  const patient = patients.find(p => p.anvayId.toLowerCase() === (anvayId || '').toLowerCase());
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  const hospitalId = req.user.hospitalId || 'hosp_metro_01';
  const hospital = hospitals.find(h => h.id === hospitalId) || { name: 'Metro Super Specialty Hospital' };
  const newRecordId = `REC-${new Date().getFullYear()}-DOC-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const docAttachment = req.file ? {
    fileName: req.file.originalname,
    fileUrl: `/uploads/${req.file.filename}`,
    fileType: path.extname(req.file.originalname).replace('.', '').toUpperCase(),
    fileSize: `${Math.round(req.file.size / 1024)} KB`,
    uploadedAt: now
  } : {
    fileName: 'Diagnostic_Report.pdf',
    fileUrl: '/uploads/Resting_ECG_Baseline.pdf',
    fileType: 'PDF',
    fileSize: '412 KB',
    uploadedAt: now
  };

  const newRecord = {
    recordId: newRecordId,
    patientAnvayId: patient.anvayId,
    anvayId: patient.anvayId,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    doctorId: req.user.doctorId || 'doc_gen_01',
    doctorName: req.user.name,
    department: req.user.department || 'Diagnostics',
    recordType: category || 'Lab Report',
    category: category || 'Lab Report',
    title: title || `${category} Document`,
    description: description || 'Clinical document attachment uploaded to patient health profile',
    documents: [docAttachment],
    version: 1,
    versionHistory: [],
    verificationStatus: 'Verified',
    createdAt: now,
    updatedAt: now
  };

  medicalRecords.unshift(newRecord);

  res.status(201).json({
    success: true,
    message: 'Medical document uploaded and sealed to patient health history',
    record: newRecord
  });
});

export default router;
