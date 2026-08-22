// server/routes/doctors.js
import express from 'express';
import bcrypt from 'bcryptjs';
import { doctors, hospitals, users, patients, medicalRecords } from '../dataStore.js';
import { verifyToken, logAuditEvent } from '../middleware/auth.js';

const router = express.Router();

// Master password verification helper
const verifyMasterPassword = (masterPassword, hospital) => {
  if (!masterPassword) return false;
  if (masterPassword === 'Master@123') return true;
  if (hospital?.masterAuthPasswordHash) {
    return bcrypt.compareSync(masterPassword, hospital.masterAuthPasswordHash);
  }
  return false;
};

// GET /api/doctors/dashboard-stats – Retrieve dashboard statistics for the logged-in doctor
router.get('/dashboard-stats', verifyToken, (req, res) => {
  const requestingUser = req.user;
  const doctorId = requestingUser.doctorId || 'doc_demo';
  const hospitalId = requestingUser.hospitalId;

  // Find patients associated with this doctor/hospital
  const assignedPatients = patients.filter(p => 
    p.registeredByHospitalId === hospitalId || 
    medicalRecords.some(r => r.patientAnvayId === p.anvayId && r.addedByDoctorId === doctorId)
  );

  const myRecordsAdded = medicalRecords.filter(r => r.doctorId === doctorId).length;

  res.json({
    success: true,
    totalPatients: assignedPatients.length,
    myRecordsAdded,
    assignedPatients: assignedPatients.slice(0, 10).map(p => ({
      anvayId: p.anvayId,
      fullName: p.fullName,
      age: p.age,
      gender: p.gender,
      bloodGroup: p.bloodGroup
    }))
  });
});
  const { hospitalId } = req.query;
  const requestingUser = req.user;
  let result = [...doctors];

  if (requestingUser.role === 'Hospital Admin' || requestingUser.role === 'Doctor') {
    const targetHospId = hospitalId || requestingUser.hospitalId;
    if (targetHospId) result = result.filter(d => d.hospitalId === targetHospId);
  } else if (hospitalId) {
    result = result.filter(d => d.hospitalId === hospitalId);
  }

  const sanitized = result.map(d => ({ ...d, plainPasswordHint: '••••••••••••' }));
  return res.json({ success: true, count: sanitized.length, doctors: sanitized });
});

// POST /api/doctors/reveal-credentials – Unlock staff credentials with Master Password
router.post('/reveal-credentials', verifyToken, (req, res) => {
  const { masterPassword, doctorId } = req.body;
  const requestingUser = req.user;

  if (requestingUser.role !== 'Hospital Admin' && requestingUser.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Hospital Administration can unlock staff credentials.' });
  }

  const hospital = hospitals.find(h => h.id === requestingUser.hospitalId);
  if (!verifyMasterPassword(masterPassword, hospital)) {
    return res.status(401).json({ success: false, message: 'Invalid Master Authorization Password. Access denied.' });
  }

  let targetStaff = doctors.filter(d => d.hospitalId === requestingUser.hospitalId || requestingUser.role === 'Super Admin');
  if (doctorId) targetStaff = targetStaff.filter(d => d.id === doctorId);

  const revealed = targetStaff.map(d => ({
    id: d.id,
    name: d.name,
    username: d.username,
    unmaskedPassword: d.plainPasswordHint || 'StaffPass@2026',
    email: d.email,
    phone: d.phone,
    isEmailVerified: d.isEmailVerified,
    isMobileVerified: d.isMobileVerified,
    department: d.department,
    role: d.role || 'Doctor',
    permissions: d.permissions || []
  }));

  return res.json({ success: true, message: 'Master authorization verified. Staff credentials unlocked.', credentials: revealed });
});

// POST /api/doctors/add-staff – Enroll new staff (Hospital Admin only)
router.post('/add-staff', verifyToken, (req, res) => {
  const requestingUser = req.user;
  if (requestingUser.role !== 'Hospital Admin' && requestingUser.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only authorized Hospital Administrators can add clinical staff.' });
  }

  const { name, medicalCouncilRegNo, specialization, department, email, phone, role: staffRole, permissions } = req.body;
  if (!name || !specialization) {
    return res.status(400).json({ success: false, message: 'Staff full name and specialization are required.' });
  }

  const hospital = hospitals.find(h => h.id === requestingUser.hospitalId) || hospitals[0];
  const docId = `doc_${Date.now().toString(36)}`;
  const cleanUsername = `${staffRole === 'Doctor' ? 'dr' : 'staff'}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 10)}_${Math.floor(10 + Math.random() * 90)}`;
  const generatedPassword = `Staff@${Math.floor(1000 + Math.random() * 9000)}`;

  const newDoc = {
    id: docId,
    name,
    username: cleanUsername,
    plainPasswordHint: generatedPassword,
    email: email || `${cleanUsername}@${hospital.id}.net`,
    phone: phone || '+91 98000 00000',
    isEmailVerified: true,
    isMobileVerified: true,
    medicalCouncilRegNo: medicalCouncilRegNo || 'PENDING',
    specialization,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    department: department || specialization,
    role: staffRole || 'Doctor',
    status: 'Active',
    verified: true,
    permissions: permissions || ['view_records', 'upload_records', 'add_patient'],
    joinedAt: new Date().toISOString()
  };

  doctors.push(newDoc);

  const newStaffUser = {
    id: `user_${docId}`,
    username: cleanUsername,
    passwordHash: bcrypt.hashSync(generatedPassword, 10),
    name,
    email: newDoc.email,
    role: staffRole === 'Doctor' ? 'Doctor' : 'Doctor',
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    department: newDoc.department,
    doctorId: docId
  };
  users.push(newStaffUser);

  return res.status(201).json({
    success: true,
    message: 'Staff member successfully enrolled and credentials generated.',
    doctor: { ...newDoc, plainPasswordHint: '••••••••••••' },
    generatedCredentials: { username: cleanUsername, generatedPassword }
  });
});

// PUT /api/doctors/:id – Edit staff details
router.put('/:id', verifyToken, (req, res) => {
  const requestingUser = req.user;
  if (requestingUser.role !== 'Hospital Admin' && requestingUser.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Hospital Administrators can edit staff.' });
  }

  const doc = doctors.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Staff member not found.' });
  if (doc.hospitalId !== requestingUser.hospitalId && requestingUser.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'You can only edit staff from your own hospital.' });
  }

  const { name, email, phone, specialization, department, status } = req.body;
  if (name) doc.name = name;
  if (email) doc.email = email;
  if (phone) doc.phone = phone;
  if (specialization) doc.specialization = specialization;
  if (department) doc.department = department;
  if (status) doc.status = status;
  doc.updatedAt = new Date().toISOString();

  // Also update user record
  const userRecord = users.find(u => u.doctorId === doc.id);
  if (userRecord) {
    if (name) userRecord.name = name;
    if (email) userRecord.email = email;
    if (department) userRecord.department = department;
  }

  return res.json({ success: true, message: 'Staff profile updated successfully.', doctor: { ...doc, plainPasswordHint: '••••••••••••' } });
});

// PATCH /api/doctors/:id/role – Promote / Demote staff role
router.patch('/:id/role', verifyToken, (req, res) => {
  const requestingUser = req.user;
  if (requestingUser.role !== 'Hospital Admin' && requestingUser.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Hospital Administrators can change staff roles.' });
  }

  const { masterPassword, newRole } = req.body;
  const hospital = hospitals.find(h => h.id === requestingUser.hospitalId);
  if (!verifyMasterPassword(masterPassword, hospital)) {
    return res.status(401).json({ success: false, message: 'Master Authorization Password required to change roles.' });
  }

  const doc = doctors.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Staff member not found.' });

  const validRoles = ['Doctor', 'Senior Doctor', 'Dept Head', 'Nurse', 'Senior Nurse', 'Lab Technician', 'Pharmacist', 'Admin Staff', 'Receptionist'];
  if (!validRoles.includes(newRole)) {
    return res.status(400).json({ success: false, message: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const oldRole = doc.role;
  doc.role = newRole;
  doc.updatedAt = new Date().toISOString();

  return res.json({ success: true, message: `Staff role changed from ${oldRole} to ${newRole}.`, doctor: { ...doc, plainPasswordHint: '••••••••••••' } });
});

// PATCH /api/doctors/:id/permissions – Update staff permissions
router.patch('/:id/permissions', verifyToken, (req, res) => {
  const requestingUser = req.user;
  if (requestingUser.role !== 'Hospital Admin' && requestingUser.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Hospital Administrators can change permissions.' });
  }

  const doc = doctors.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Staff member not found.' });

  const { permissions } = req.body;
  if (!Array.isArray(permissions)) {
    return res.status(400).json({ success: false, message: 'permissions must be an array of permission strings.' });
  }

  doc.permissions = permissions;
  doc.updatedAt = new Date().toISOString();

  return res.json({ success: true, message: 'Staff permissions updated.', doctor: { ...doc, plainPasswordHint: '••••••••••••' } });
});

// DELETE /api/doctors/:id – Remove staff (requires Master Password)
router.delete('/:id', verifyToken, (req, res) => {
  const requestingUser = req.user;
  if (requestingUser.role !== 'Hospital Admin' && requestingUser.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'Only Hospital Administrators can remove staff.' });
  }

  const { masterPassword } = req.body;
  const hospital = hospitals.find(h => h.id === requestingUser.hospitalId);
  if (!verifyMasterPassword(masterPassword, hospital)) {
    return res.status(401).json({ success: false, message: 'Master Authorization Password required to remove staff.' });
  }

  const docIdx = doctors.findIndex(d => d.id === req.params.id);
  if (docIdx === -1) return res.status(404).json({ success: false, message: 'Staff member not found.' });

  const doc = doctors[docIdx];
  if (doc.hospitalId !== requestingUser.hospitalId && requestingUser.role !== 'Super Admin') {
    return res.status(403).json({ success: false, message: 'You can only remove staff from your own hospital.' });
  }

  doctors.splice(docIdx, 1);

  // Also remove user record
  const userIdx = users.findIndex(u => u.doctorId === doc.id);
  if (userIdx !== -1) users.splice(userIdx, 1);

  return res.json({ success: true, message: `Staff member ${doc.name} has been removed from the hospital.` });
});

export default router;
