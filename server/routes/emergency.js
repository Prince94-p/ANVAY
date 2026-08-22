import express from 'express';
import { store } from '../dataStore.js';
import { authenticateToken, requireVerifiedHospital, logAuditEvent } from '../middleware/auth.js';

const router = express.Router();

// Break-Glass Emergency Lookup
router.post('/break-glass-access', authenticateToken, requireVerifiedHospital, (req, res) => {
  const { anvayId, govtIdRef, emergencyReason, attendingDoctorName } = req.body;

  if (!emergencyReason || emergencyReason.trim().length < 8) {
    return res.status(400).json({
      success: false,
      message: 'A detailed clinical justification for emergency break-glass access is mandatory.'
    });
  }

  let patient = null;
  if (anvayId) {
    patient = store.patients.find(p => p.anvayId.toLowerCase() === anvayId.trim().toLowerCase());
  } else if (govtIdRef) {
    patient = store.patients.find(p => p.govtIdRef.toLowerCase() === govtIdRef.trim().toLowerCase());
  }

  if (!patient) {
    return res.status(404).json({ success: false, message: 'Patient not found in the ANVAY network' });
  }

  const hospitalId = req.user.hospitalId || 'HOSP-EMERGENCY';
  const hospital = store.hospitals.find(h => h.id === hospitalId) || { name: 'Emergency Hospital' };
  const doctorName = attendingDoctorName || req.user.name;

  // Log HIGH-ALERT Audit Event
  logAuditEvent({
    action: 'Emergency Break-Glass Access Invoked',
    actorName: doctorName,
    actorRole: req.user.role,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    patientAnvayId: patient.anvayId,
    details: `BREAK-GLASS EMERGENCY ACCESS INVOKED by ${doctorName} at ${hospital.name}. Clinical Reason: "${emergencyReason}".`,
    severity: 'HIGH_ALERT'
  });

  // Extract only critical emergency data
  const criticalAllergies = (patient.allergies || []).filter(a => a.status === 'Confirmed Positive' || a.severity === 'Severe');
  const criticalConditions = (patient.chronicConditions || []).filter(c => c.status && c.status.includes('Active'));
  const activeMedications = patient.activeMedicines || [];

  // Recent vital records
  const recentCriticalRecords = store.records
    .filter(r => r.patientAnvayId.toLowerCase() === patient.anvayId.toLowerCase())
    .slice(0, 4)
    .map(r => ({
      recordId: r.recordId,
      recordType: r.recordType,
      title: r.title,
      hospitalName: r.hospitalName,
      doctorName: r.doctorName,
      createdAt: r.createdAt
    }));

  res.json({
    success: true,
    message: 'Emergency Break-Glass Access authorized and logged to central audit trail',
    emergencyPayload: {
      anvayId: patient.anvayId,
      fullName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,
      emergencyContactName: patient.emergencyContactName,
      emergencyContactPhone: patient.emergencyContactPhone,
      criticalAllergies,
      criticalConditions,
      activeMedications,
      recentCriticalRecords,
      accessTimestamp: new Date().toISOString(),
      authorizedHospital: hospital.name,
      attendingPhysician: doctorName,
      loggedReason: emergencyReason
    }
  });
});

export default router;
