// auth.middleware.js
// Express middleware for verifying JWT access tokens and role authorizations

import { verifyAccessToken } from '../utils/auth.js';
import prisma from '../config/db.js';

const ROLE_LEVELS = {
  SUPER_ADMIN: 4,
  ADMIN: 3,
  EDITOR: 2,
  MODERATOR: 1,
};

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, data: null, error: 'Access token required' });
  }

  const decoded = await verifyAccessToken(token);
  if (!decoded) {
    return res.status(403).json({ success: false, data: null, error: 'Invalid or expired access token' });
  }

  // Double check in database that user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, role: true, totpEnabled: true },
  });

  if (!user) {
    return res.status(403).json({ success: false, data: null, error: 'User no longer exists' });
  }

  req.user = user;
  next();
}

export function requireRole(minimumRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, data: null, error: 'Unauthorized' });
    }

    const userLevel = ROLE_LEVELS[req.user.role] || 0;
    const requiredLevel = ROLE_LEVELS[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        data: null,
        error: `Insufficient permissions. Required role: ${minimumRole}`,
      });
    }

    next();
  };
}
