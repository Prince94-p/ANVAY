import express from 'express';
import { store } from '../dataStore.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get Audit Logs (Super Admin or Authorized Auditor)
router.get('/', authenticateToken, requireRole(['Super Admin', 'Hospital Admin']), (req, res) => {
  const { action, hospitalId, severity, limit = 50 } = req.query;
  let logs = store.auditLogs;

  // Hospital Admins can only see audit events pertaining to their hospital
  if (req.user.role === 'Hospital Admin') {
    logs = logs.filter(l => l.hospitalId === req.user.hospitalId);
  }

  if (action && action !== 'All') {
    logs = logs.filter(l => l.action.toLowerCase().includes(action.toLowerCase()));
  }

  if (hospitalId && hospitalId !== 'All') {
    logs = logs.filter(l => l.hospitalId === hospitalId);
  }

  if (severity && severity !== 'All') {
    logs = logs.filter(l => l.severity.toLowerCase() === severity.toLowerCase());
  }

  res.json({
    success: true,
    total: logs.length,
    logs: logs.slice(0, parseInt(limit, 10))
  });
});

export default router;
