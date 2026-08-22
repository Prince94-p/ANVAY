import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { patients, hospitals, medicalRecords, auditLogs, users } from '../dataStore.js';
import { authenticateToken, requireRole, requireVerifiedHospital, logAuditEvent } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `PAT-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = express.Router();

// Helper to generate unique ANVAY Health ID
const generateAnvayId = () => {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const id = `ANVAY-${year}-${randomPart}`;
  if (patients.some(p => p.anvayId === id)) {
    return generateAnvayId();
  }
  return id;
};

// Helper to compute completeness score and missing records
export const computePatientCompleteness = (patient) => {
  const missingFields = [];
  let score = 100;

  if (!patient.bloodGroup || patient.bloodGroup === 'Unknown') {
    score -= 15;
    missingFields.push({
      field: 'Blood Group',
      category: 'Basic Clinical',
      status: 'No Known Record',
      message: 'Blood group has not been tested or recorded in the network'
    });
  }

  if (!patient.allergies || patient.allergies.length === 0) {
    score -= 20;
    missingFields.push({
      field: 'Allergy Status',
      category: 'Allergy',
      status: 'No Known Record',
      message: 'Allergy profile is unrecorded. Clinician must verify for NKDA or specific sensitivities'
    });
  }

  const confirmedVaccines = (patient.vaccinations || []).filter(v => v.status === 'Confirmed');
  if (confirmedVaccines.length === 0) {
    score -= 20;
    missingFields.push({
      field: 'Immunization History',
      category: 'Vaccination',
      status: 'No Known Record',
      message: 'No confirmed vaccination entries found across connected hospitals'
    });
  }

  if (!patient.emergencyContactPhone) {
    score -= 10;
    missingFields.push({
      field: 'Emergency Contact',
      category: 'Demographics',
      status: 'No Known Record',
      message: 'Primary emergency contact telephone number missing'
    });
  }

  score = Math.max(20, Math.min(100, score));

  return {
    score,
    missingFields
  };
};

// Search Patients
router.get('/search', authenticateToken, (req, res) => {
  const { query, anvayId, govtIdRef } = req.query;
  let results = [...patients];

  if (anvayId) {
    results = results.filter(p => p.anvayId.toLowerCase() === anvayId.trim().toLowerCase());
  } else if (govtIdRef) {
    results = results.filter(p => p.govtIdRef.toLowerCase() === govtIdRef.trim().toLowerCase());
  } else if (query) {
    const q = query.trim().toLowerCase();
    results = results.filter(p =>
      p.anvayId.toLowerCase().includes(q) ||
      p.govtIdRef.toLowerCase().includes(q) ||
      p.fullName.toLowerCase().includes(q) ||
      (p.contactPhone && p.contactPhone.includes(q))
    );
  }

  const sanitized = results.map(p => ({
    anvayId: p.anvayId,
    govtIdRef: p.govtIdRef.replace(/\d{4}$/, 'XXXX'),
    fullName: p.fullName,
    age: p.age,
    gender: p.gender,
    bloodGroup: p.bloodGroup,
    district: p.district,
    state: p.state,
    registeredByHospitalName: p.registeredByHospitalName
  }));

  res.json({
    success: true,
    total: sanitized.length,
    patients: sanitized
  });
});

// Check Duplicate Government ID
router.get('/check-duplicate-identity', authenticateToken, (req, res) => {
  const { govtIdRef } = req.query;
  if (!govtIdRef) {
    return res.status(400).json({ success: false, message: 'govtIdRef is required' });
  }

  const existing = patients.find(p => p.govtIdRef.trim().toLowerCase() === govtIdRef.trim().toLowerCase());
  if (existing) {
    return res.json({
      success: true,
      isDuplicate: true,
      message: 'Verified national identity is already registered with an existing ANVAY profile',
      existingAnvayId: existing.anvayId,
      existingPatientName: existing.fullName,
      registeredAtHospital: existing.registeredByHospitalName
    });
  }

  res.json({
    success: true,
    isDuplicate: false,
    message: 'Identity reference is unique. Safe to create new ANVAY profile.'
  });
});

// Create New Patient (Authorized Hospital or Doctor)
router.post('/create', authenticateToken, requireRole(['Doctor', 'Hospital Admin', 'Super Admin']), upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 }
]), (req, res) => {
  const {
    govtIdRef,
    fullName,
    dateOfBirth,
    gender,
    bloodGroup,
    contactPhone,
    email,
    password,
    emergencyContactName,
    emergencyContactPhone,
    address,
    district,
    state,
    initialAllergies,
    initialConditions
  } = req.body;

  if (!govtIdRef || !fullName || !dateOfBirth) {
    return res.status(400).json({ success: false, message: 'Missing essential patient identity fields (name, DOB, ID number)' });
  }

  const duplicate = patients.find(p => p.govtIdRef.trim().toLowerCase() === govtIdRef.trim().toLowerCase());
  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: `Duplicate identity! Patient already registered with ANVAY ID: ${duplicate.anvayId}`,
      existingAnvayId: duplicate.anvayId
    });
  }

  const hospitalId = req.user.hospitalId || 'hosp_metro_01';
  const hospital = hospitals.find(h => h.id === hospitalId) || { name: 'Hospital' };

  const birthDate = new Date(dateOfBirth);
  const diffYears = Math.floor((new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  const newAnvayId = generateAnvayId();

  const profilePhotoFile = req.files?.profilePhoto?.[0];
  const idDocFile = req.files?.idDocument?.[0];

  const newPatient = {
    anvayId: newAnvayId,
    govtIdRef,
    fullName,
    dateOfBirth,
    age: isNaN(diffYears) ? 30 : diffYears,
    gender: gender || 'Other',
    bloodGroup: bloodGroup || 'O+',
    contactPhone: contactPhone || '',
    email: email || '',
    emergencyContactName: emergencyContactName || '',
    emergencyContactPhone: emergencyContactPhone || '',
    address: address || '',
    district: district || 'Central',
    state: state || 'National',
    registeredByHospitalId: hospital.id,
    registeredByHospitalName: hospital.name,
    registeredAt: new Date().toISOString(),
    profilePhotoUrl: profilePhotoFile ? `/uploads/${profilePhotoFile.filename}` : null,
    idDocumentUrl: idDocFile ? `/uploads/${idDocFile.filename}` : null,
    allergies: initialAllergies ? (typeof initialAllergies === 'string' ? JSON.parse(initialAllergies) : initialAllergies) : [],
    chronicConditions: initialConditions ? (typeof initialConditions === 'string' ? JSON.parse(initialConditions) : initialConditions) : [],
    activeMedicines: [],
    vaccinations: []
  };

  newPatient.completeness = computePatientCompleteness(newPatient);
  patients.push(newPatient);

  // Automatically create a user record so they can log in
  const patientPassword = password || 'password123';
  const newUser = {
    id: `user_patient_${newAnvayId}`,
    username: newAnvayId.toLowerCase(),
    passwordHash: bcrypt.hashSync(patientPassword, 10),
    name: fullName,
    email: email || `${newAnvayId.toLowerCase()}@anvay.patient.net`,
    role: 'Patient',
    anvayId: newAnvayId,
    phone: contactPhone || '',
    tempPassword: !password // Set temp password flag if hospital didn't set password or generated default
  };
  users.push(newUser);

  logAuditEvent({
    action: 'Patient Registered by Hospital',
    actorName: req.user.name,
    actorRole: req.user.role,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    details: `Registered patient ${fullName} with ANVAY ID ${newAnvayId}`,
    severity: 'INFO'
  });

  res.status(201).json({
    success: true,
    message: 'Patient profile and unique ANVAY Health ID generated successfully',
    patient: newPatient
  });
});

// Get Clinical Snapshot for patient
router.get('/:anvayId/snapshot', authenticateToken, (req, res) => {
  const patient = patients.find(p => p.anvayId.toLowerCase() === req.params.anvayId.toLowerCase());
  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found' });
  }

  patient.completeness = computePatientCompleteness(patient);

  const patientRecords = (medicalRecords || [])
    .filter(r => (r.patientAnvayId || r.anvayId || '').toLowerCase() === patient.anvayId.toLowerCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const lastRecord = patientRecords[0];
  const lastVisit = lastRecord ? {
    hospitalName: lastRecord.hospitalName,
    doctorName: lastRecord.doctorName,
    date: lastRecord.createdAt,
    department: lastRecord.department,
    diagnosisOrReason: lastRecord.title
  } : null;

  const recentDiagnoses = patientRecords.filter(r => r.recordType === 'Diagnosis').slice(0, 3);
  const recentReports = patientRecords.filter(r => r.recordType === 'Lab Report' || r.recordType === 'Imaging Report').slice(0, 3);
  const activePrescriptions = patientRecords.filter(r => r.recordType === 'Prescription').slice(0, 3);

  res.json({
    success: true,
    snapshot: {
      patient,
      lastVisit,
      recentDiagnoses,
      recentReports,
      activePrescriptions,
      totalConnectedRecords: patientRecords.length,
      contributingHospitals: [...new Set(patientRecords.map(r => r.hospitalName))]
    }
  });
});

export default router;
