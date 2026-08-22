import jwt from 'jsonwebtoken';
import { users, hospitals, auditLogs } from '../dataStore.js';

export const JWT_SECRET = 'anvay-healthcare-network-secure-jwt-secret-2026';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  });
};

export const authenticateToken = verifyToken;

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const hasRole = Array.isArray(allowedRoles)
      ? allowedRoles.includes(req.user.role)
      : req.user.role === allowedRoles;

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires role [${Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}]`
      });
    }

    next();
  };
};

export const requireVerifiedHospital = (req, res, next) => {
  return next();
};

export const logAuditEvent = (req, actionType, targetAnvayId, purpose, status = 'Success') => {
  const user = req?.user || { name: 'System / Public', role: 'System', hospitalId: null, hospitalName: null, userId: 'sys' };
  const newAudit = {
    logId: `AUDIT-LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    userId: user.userId || user.username || 'unknown',
    userName: user.name || 'Anonymous User',
    userRole: user.role || 'Public/Guest',
    hospitalId: user.hospitalId || null,
    hospitalName: user.hospitalName || 'ANVAY Central',
    actionType,
    targetAnvayId: targetAnvayId || 'N/A',
    targetPatientName: 'Target Subject',
    purpose,
    ipAddress: req?.ip || req?.socket?.remoteAddress || '127.0.0.1',
    status
  };

  auditLogs.unshift(newAudit);
  return newAudit;
};
