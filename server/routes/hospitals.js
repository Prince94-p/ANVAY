import express from 'express';
import { store } from '../dataStore.js';
import { authenticateToken, requireRole, logAuditEvent } from '../middleware/auth.js';

const router = express.Router();

// List all hospitals
router.get('/', authenticateToken, (req, res) => {
  const { status, state, district } = req.query;
  let result = store.hospitals;

  if (status) {
    result = result.filter(h => h.verificationStatus.toLowerCase() === status.toLowerCase());
  }
  if (state) {
    result = result.filter(h => h.state.toLowerCase() === state.toLowerCase());
  }
  if (district) {
    result = result.filter(h => h.district.toLowerCase() === district.toLowerCase());
  }

  res.json({
    success: true,
    total: result.length,
    hospitals: result
  });
});

// Get hospital by ID
router.get('/:id', authenticateToken, (req, res) => {
  const hospital = store.hospitals.find(h => h.id === req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  // Get affiliated doctors
  const affiliatedDoctors = store.doctors.filter(d => d.hospitalId === hospital.id);

  res.json({
    success: true,
    hospital,
    doctors: affiliatedDoctors
  });
});

// Register a new hospital (Public / Hospital Admin initiation)
router.post('/register', (req, res) => {
  const {
    name,
    regNumber,
    type,
    address,
    district,
    state,
    contactPhone,
    email,
    authorizedRepresentative,
    departments,
    adminUsername,
    adminPassword
  } = req.body;

  if (!name || !regNumber || !email || !state || !district) {
    return res.status(400).json({ success: false, message: 'Missing required hospital fields' });
  }

  // Check duplicate registration number
  const existing = store.hospitals.find(h => h.regNumber.toLowerCase() === regNumber.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, message: 'A hospital with this registration number already exists' });
  }

  const newHospitalId = `HOSP-00${store.hospitals.length + 1}`;
  const newHospital = {
    id: newHospitalId,
    name,
    regNumber,
    type: type || 'General Hospital',
    address,
    district,
    state,
    contactPhone,
    email,
    authorizedRepresentative,
    verificationStatus: 'Pending Verification',
    isVerified: false,
    registeredAt: new Date().toISOString(),
    verifiedAt: null,
    verifiedBy: null,
    documents: ['uploaded_registration_certificate.pdf'],
    departments: departments || ['General Medicine', 'Emergency Care']
  };

  store.hospitals.push(newHospital);

  // If admin credentials provided, create user
  if (adminUsername && adminPassword) {
    store.users.push({
      id: `USR-${Date.now().toString().slice(-6)}`,
      username: adminUsername,
      password: adminPassword,
      name: authorizedRepresentative || `${name} Administrator`,
      email,
      role: 'Hospital Admin',
      hospitalId: newHospitalId,
      hospitalName: name,
      doctorId: null
    });
  }

  logAuditEvent({
    action: 'Hospital Registration Submitted',
    actorName: authorizedRepresentative || 'Hospital Representative',
    actorRole: 'Hospital Admin',
    hospitalId: newHospitalId,
    hospitalName: name,
    details: `Hospital registration submitted: ${name} (${regNumber}). Status: Pending Verification.`,
    severity: 'INFO'
  });

  res.status(201).json({
    success: true,
    message: 'Hospital registered successfully. Awaiting Super Admin review and verification.',
    hospital: newHospital
  });
});

// Update Hospital Verification Status (Super Admin Only)
router.patch('/:id/verify', authenticateToken, requireRole('Super Admin'), (req, res) => {
  const { status, remarks } = req.body; // 'Approved', 'Rejected', 'Suspended'
  const hospital = store.hospitals.find(h => h.id === req.params.id);

  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  if (!['Approved', 'Rejected', 'Suspended', 'Pending Verification'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid verification status' });
  }

  hospital.verificationStatus = status;
  hospital.isVerified = status === 'Approved';
  hospital.verifiedAt = status === 'Approved' ? new Date().toISOString() : null;
  hospital.verifiedBy = req.user.name;
  if (remarks) hospital.verificationRemarks = remarks;

  logAuditEvent({
    action: `Hospital ${status}`,
    actorName: req.user.name,
    actorRole: req.user.role,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    details: `Hospital verification status updated to [${status}]. Remarks: ${remarks || 'None'}`,
    severity: status === 'Approved' ? 'SECURITY' : 'HIGH_ALERT'
  });

  res.json({
    success: true,
    message: `Hospital verification status updated to ${status}`,
    hospital
  });
});

// Update Hospital Profile
router.put('/:id', authenticateToken, (req, res) => {
  const hospital = store.hospitals.find(h => h.id === req.params.id);
  if (!hospital) {
    return res.status(404).json({ success: false, message: 'Hospital not found' });
  }

  // Only allow updating if requesting user belongs to the hospital or is super admin
  if (req.user.role !== 'Super Admin' && req.user.hospitalId !== hospital.id) {
    return res.status(403).json({ success: false, message: 'Unauthorized to update this hospital profile.' });
  }

  const { name, regNumber, type, address, district, state, contactPhone, email, authorizedRepresentative, departments } = req.body;

  if (name) hospital.name = name;
  if (regNumber) hospital.regNumber = regNumber;
  if (type) hospital.type = type;
  if (address) hospital.address = address;
  if (district) hospital.district = district;
  if (state) hospital.state = state;
  if (contactPhone) hospital.contactPhone = contactPhone;
  if (email) hospital.email = email;
  if (authorizedRepresentative) hospital.authorizedRepresentative = authorizedRepresentative;
  if (departments && Array.isArray(departments)) hospital.departments = departments;

  logAuditEvent({
    action: 'Hospital Profile Updated',
    actorName: req.user.name,
    actorRole: req.user.role,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    details: `Hospital profile fields updated.`,
    severity: 'INFO'
  });

  res.json({
    success: true,
    message: 'Hospital profile updated successfully',
    hospital
  });
});

export default router;
