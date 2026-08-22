import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import hospitalRoutes from './routes/hospitals.js';
import doctorRoutes from './routes/doctors.js';
import patientRoutes from './routes/patients.js';
import recordRoutes from './routes/records.js';
import emergencyRoutes from './routes/emergency.js';
import analyticsRoutes from './routes/analytics.js';
import auditRoutes from './routes/audit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Ensure uploads folder with mock medical files exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Generate sample text & report files if missing
const sampleEcg = path.join(uploadsDir, 'sample_ecg.pdf');
if (!fs.existsSync(sampleEcg)) {
  fs.writeFileSync(sampleEcg, '%PDF-1.4 sample ECG report placeholder document');
}

const sampleLipid = path.join(uploadsDir, 'sample_lipid.pdf');
if (!fs.existsSync(sampleLipid)) {
  fs.writeFileSync(sampleLipid, '%PDF-1.4 sample Lipid Profile Biochemistry report');
}

const sampleClinicalNotes = path.join(uploadsDir, 'clinical_notes_kmt.txt');
if (!fs.existsSync(sampleClinicalNotes)) {
  fs.writeFileSync(sampleClinicalNotes, 'PATIENT CLINICAL IMPRESSION NOTE\nDate: 2026-02-10\nHospital: Kerala Medical Trust Hospital\nPhysician: Dr. Rajesh Nair, MD (Internal Medicine)\nPatient: Aarav Kumar (ANVAY-2026-8F29K4)\n\nHistory: Mild dehydration secondary to acute gastroenteritis.\nPrior Records Inspected: Metro Super Specialty Hospital (2024 Hypertension), Apex Care (2025 Asthma).\nAction: Rehydration therapy. Maintained existing cardiopulmonary medications.\nStatus: Stable for outpatient follow-up.\n');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files securely
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'ANVAY - Interconnected Hospital Healthcare Network',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🏥 ANVAY Healthcare Interoperability Server running on port ${PORT}`);
});
