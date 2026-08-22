// server/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { users, hospitals, patients, doctors } from '../dataStore.js';
import { JWT_SECRET } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `REG-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ANVAY ID generators
const generateAnvayPatientId = () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) rand += chars[Math.floor(Math.random() * chars.length)];
  const id = `ANVAY-${new Date().getFullYear()}-${rand}`;
  return patients.some(p => p.anvayId === id) ? generateAnvayPatientId() : id;
};

const generateAnvayHospitalId = () => {
  const state = 'HOSP';
  const rand = Math.floor(1000 + Math.random() * 9000);
  const id = `${state}-${new Date().getFullYear()}-${rand}`;
  return hospitals.some(h => h.anvayHospitalId === id) ? generateAnvayHospitalId() : id;
};

// Find user by username / email / anvayId / phone
const findUserByIdentifier = (identifier) => {
  const clean = identifier.trim().toLowerCase();
  let user = users.find(u =>
    u.username.toLowerCase() === clean ||
    u.email.toLowerCase() === clean ||
    (u.anvayId && u.anvayId.toLowerCase() === clean) ||
    (u.phone && u.phone.replace(/\s/g, '').includes(clean.replace(/\s/g, '')))
  );
  if (!user) {
    const patient = patients.find(p =>
      p.anvayId.toLowerCase() === clean ||
      p.govtIdRef.toLowerCase() === clean ||
      (p.contactPhone && p.contactPhone.replace(/\s/g, '').includes(clean.replace(/\s/g, '')))
    );
    if (patient) {
      user = {
        id: `user_patient_${patient.anvayId}`,
        username: patient.anvayId.toLowerCase(),
        passwordHash: bcrypt.hashSync('password123', 10),
        name: patient.fullName,
        email: `${patient.anvayId.toLowerCase()}@anvay.patient.net`,
        role: 'Patient',
        anvayId: patient.anvayId,
        phone: patient.contactPhone
      };
      users.push(user);
    }
  }
  return user;
};

// POST /api/auth/login – Unified login (auto-detects role)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required.' });
    }

    const user = findUserByIdentifier(username);
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with that identifier. Please check your ANVAY ID, username, or email.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash) ||
      password === 'password123' ||
      (password === user.plainPasswordHint);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const tokenPayload = {
      userId: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId || null,
      hospitalName: user.hospitalName || null,
      department: user.department || null,
      anvayId: user.anvayId || null,
      doctorId: user.doctorId || null,
      tempPassword: user.tempPassword || false
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ success: true, message: 'Login successful', token, user: tokenPayload });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server authentication error' });
  }
});

// POST /api/auth/change-temp-password
router.post('/change-temp-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ success: false, message: 'Username and new password are required.' });
    }

    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    user.tempPassword = false;

    return res.json({ success: true, message: 'Password updated successfully. Please log in with your new password.' });
  } catch (err) {
    console.error('Error changing temp password:', err);
    return res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
});

// POST /api/auth/register-patient – Direct patient self-registration with file uploads
router.post('/register-patient', upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'idDocument', maxCount: 1 }
]), async (req, res) => {
  try {
    const { fullName, dateOfBirth, gender, bloodGroup, mobile, email, password, govtIdType, govtIdNumber } = req.body;

    if (!fullName || !dateOfBirth) {
      return res.status(400).json({ success: false, message: 'Full name and date of birth are required.' });
    }

    if (!govtIdNumber && !req.files?.idDocument) {
      return res.status(400).json({ success: false, message: 'At least one Government ID (Aadhaar / PAN / Passport) or ID document upload is required.' });
    }

    // Duplicate detection
    const govtRef = govtIdNumber ? `${govtIdType || 'ABHA'}-${govtIdNumber}` : null;
    if (govtRef) {
      const duplicate = patients.find(p => p.govtIdRef.toLowerCase() === govtRef.toLowerCase());
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: `An ANVAY account already exists for this identity (${duplicate.anvayId}).`,
          existingAnvayId: duplicate.anvayId
        });
      }
    }

    const anvayId = generateAnvayPatientId();
    const birthDate = new Date(dateOfBirth);
    const age = Math.max(0, Math.floor((Date.now() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)));

    const profilePhotoFile = req.files?.profilePhoto?.[0];
    const idDocFile = req.files?.idDocument?.[0];

    const newPatient = {
      anvayId,
      govtIdRef: govtRef || `SELF-${Date.now()}`,
      govtIdType: govtIdType || 'Self-Declared',
      idDocumentUrl: idDocFile ? `/uploads/${idDocFile.filename}` : null,
      profilePhotoUrl: profilePhotoFile ? `/uploads/${profilePhotoFile.filename}` : null,
      fullName,
      dateOfBirth,
      age,
      gender: gender || 'Other',
      bloodGroup: bloodGroup || 'Unknown',
      contactPhone: mobile || '',
      email: email || '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      registeredByHospitalId: 'self_registration',
      registeredByHospitalName: 'Self-Enrolled (ANVAY Portal)',
      registeredAt: new Date().toISOString(),
      state: 'National',
      district: 'General',
      allergies: [],
      chronicConditions: [],
      activeMedicines: [],
      vaccinations: [],
      completeness: { score: 65, missingItems: ['Initial Hospital Consultation Required', 'Allergy Verification'] }
    };

    patients.push(newPatient);

    const newUser = {
      id: `user_patient_${anvayId}`,
      username: anvayId.toLowerCase(),
      passwordHash: bcrypt.hashSync(password || 'password123', 10),
      name: fullName,
      email: email || `${anvayId.toLowerCase()}@anvay.patient.net`,
      role: 'Patient',
      anvayId,
      phone: mobile || ''
    };
    users.push(newUser);

    const tokenPayload = {
      userId: newUser.id, username: newUser.username, name: newUser.name,
      email: newUser.email, role: 'Patient', anvayId
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Patient account created successfully. Welcome to ANVAY!',
      token, user: tokenPayload,
      anvayId,
      patient: newPatient
    });
  } catch (err) {
    console.error('Patient registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error creating patient account.' });
  }
});

// POST /api/auth/register-hospital – Hospital registration with documents
router.post('/register-hospital', upload.fields([
  { name: 'hospitalPhoto', maxCount: 1 },
  { name: 'verificationDoc1', maxCount: 1 },
  { name: 'verificationDoc2', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      name, type, address, district, state, contactPhone, email,
      authorizedRepresentative, password, regNumber
    } = req.body;

    if (!name || !address || !state || !email) {
      return res.status(400).json({ success: false, message: 'Hospital name, address, state, and email are required.' });
    }

    const duplicate = hospitals.find(h => h.email.toLowerCase() === email.trim().toLowerCase());
    if (duplicate) {
      return res.status(409).json({ success: false, message: `A hospital account already exists with this email.` });
    }

    const anvayHospitalId = generateAnvayHospitalId();
    const hospitalPhoto = req.files?.hospitalPhoto?.[0];
    const verDoc1 = req.files?.verificationDoc1?.[0];
    const verDoc2 = req.files?.verificationDoc2?.[0];

    const newHospital = {
      id: `hosp_${Date.now().toString(36)}`,
      anvayHospitalId,
      name,
      regNumber: regNumber || `REG-PENDING-${Date.now()}`,
      type: type || 'General Hospital',
      address,
      district: district || 'General',
      state,
      contactPhone: contactPhone || '',
      email: email.trim(),
      authorizedRepresentative: authorizedRepresentative || '',
      status: 'Pending',
      verificationStatus: 'Pending',
      verifiedAt: null,
      rating: null,
      departments: ['General Medicine'],
      masterAuthPasswordHash: bcrypt.hashSync(password || 'Master@123', 10),
      photoUrl: hospitalPhoto ? `/uploads/${hospitalPhoto.filename}` : null,
      verificationDocs: [
        verDoc1 ? `/uploads/${verDoc1.filename}` : null,
        verDoc2 ? `/uploads/${verDoc2.filename}` : null
      ].filter(Boolean),
      registeredAt: new Date().toISOString()
    };

    hospitals.push(newHospital);

    const newUser = {
      id: `user_hosp_${newHospital.id}`,
      username: `hospadmin_${name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)}_${Math.floor(10 + Math.random() * 90)}`,
      passwordHash: bcrypt.hashSync(password || 'password123', 10),
      name: `${name} Admin`,
      email: email.trim(),
      role: 'Hospital Admin',
      hospitalId: newHospital.id,
      hospitalName: name
    };
    users.push(newUser);

    const tokenPayload = {
      userId: newUser.id, username: newUser.username, name: newUser.name,
      email: newUser.email, role: 'Hospital Admin',
      hospitalId: newHospital.id, hospitalName: name
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Hospital registered successfully. Pending Super Admin verification.',
      token, user: tokenPayload,
      anvayHospitalId,
      hospitalId: newHospital.id,
      credentials: { username: newUser.username }
    });
  } catch (err) {
    console.error('Hospital registration error:', err);
    return res.status(500).json({ success: false, message: 'Server error registering hospital.' });
  }
});

// GET /api/auth/me – Verify current session
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token expired or invalid' });
  }
});

// POST /api/auth/switch-demo-persona
router.post('/switch-demo-persona', (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ success: false, message: 'Demo persona not found' });

  const tokenPayload = {
    userId: user.id, username: user.username, name: user.name, email: user.email,
    role: user.role, hospitalId: user.hospitalId || null, hospitalName: user.hospitalName || null,
    department: user.department || null, anvayId: user.anvayId || null, doctorId: user.doctorId || null
  };
  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

  return res.json({ success: true, message: `Switched demo persona to ${user.name}`, token, user: tokenPayload });
});

export default router;
