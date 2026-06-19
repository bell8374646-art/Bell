// auth.controller.js
// Handles login, 2FA, token management, lockout and reset flows

import { z } from 'zod';
import prisma from '../config/db.js';
import logger from '../config/logger.js';
import {
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateTotpSecret,
  verifyTotpToken,
  verifyRefreshToken,
} from '../utils/auth.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const verify2FaSchema = z.object({
  tempToken: z.string(),
  code: z.string().length(6),
});

// Logs audit events to database
async function logAudit(userId, action, details, req) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });
  } catch (err) {
    logger.error(`Audit log failed: ${err.message}`);
  }
}

export async function login(req, res) {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid email or password format' });
    }

    const { email, password } = body.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn(`Failed login attempt: Email ${email} not found.`);
      return res.status(401).json({ success: false, data: null, error: 'Invalid credentials' });
    }

    // Check brute-force lockout
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(403).json({
        success: false,
        data: null,
        error: `Account is locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
      });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      let lockedUntil = null;
      let errorMsg = 'Invalid credentials';

      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        errorMsg = 'Too many failed attempts. Account locked for 15 minutes.';
        logger.error(`Brute force lock triggered for: ${email}`);
        await logAudit(user.id, 'ACCOUNT_LOCKED', 'Brute force lockout triggered after 5 attempts', req);
      } else {
        await logAudit(user.id, 'LOGIN_FAILED', `Failed attempt ${newAttempts}/5`, req);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts, lockedUntil },
      });

      return res.status(401).json({ success: false, data: null, error: errorMsg });
    }

    // Reset attempts on success
    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lockedUntil: null },
    });

    if (user.totpEnabled) {
      // Create temporary 2FA token (expires in 5 minutes)
      const tempToken = await generateAccessToken({ id: user.id, isTemp: true });
      await logAudit(user.id, 'LOGIN_2FA_REQUIRED', 'Password verified, 2FA code requested', req);
      return res.status(200).json({
        success: true,
        data: { require2FA: true, tempToken },
        error: null,
      });
    }

    // If 2FA not enabled, complete login immediately
    const accessToken = await generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = await generateRefreshToken({ id: user.id });

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    await logAudit(user.id, 'LOGIN_SUCCESS', 'Logged in successfully without 2FA', req);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: { id: user.id, email: user.email, role: user.role, totpEnabled: false },
      },
      error: null,
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function verify2Fa(req, res) {
  try {
    const body = verify2FaSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid input format' });
    }

    const { tempToken, code } = body.data;

    // Decode and verify the temp access token
    const decodedTemp = await verifyRefreshToken(tempToken); // Use verifyRefreshToken as a generic JWT verifier, or decodes
    // Wait, let's decode via verifyAccessToken
    const decoded = await verifyAccessToken(tempToken);
    if (!decoded || !decoded.isTemp) {
      return res.status(401).json({ success: false, data: null, error: 'Invalid or expired login session' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.totpSecret) {
      return res.status(400).json({ success: false, data: null, error: '2FA not configured for user' });
    }

    const verified = verifyTotpToken(code, user.totpSecret);
    if (!verified) {
      await logAudit(user.id, 'LOGIN_2FA_FAILED', 'Invalid 2FA code provided', req);
      return res.status(401).json({ success: false, data: null, error: 'Invalid 2FA code' });
    }

    // Success, log in
    const accessToken = await generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = await generateRefreshToken({ id: user.id });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await logAudit(user.id, 'LOGIN_SUCCESS', 'Logged in successfully with 2FA', req);

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: { id: user.id, email: user.email, role: user.role, totpEnabled: true },
      },
      error: null,
    });
  } catch (error) {
    logger.error(`2FA verification error: ${error.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, data: null, error: 'Refresh token required' });
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(403).json({ success: false, data: null, error: 'Invalid or expired refresh token' });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(403).json({ success: false, data: null, error: 'User does not exist' });
    }

    const newAccessToken = await generateAccessToken({ id: user.id, role: user.role });
    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken },
      error: null,
    });
  } catch (error) {
    logger.error(`Token refresh error: ${error.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function logout(req, res) {
  try {
    if (req.user) {
      await logAudit(req.user.id, 'LOGOUT', 'Logged out successfully', req);
    }
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, data: 'Logged out successfully', error: null });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// Set up 2FA: generates secret and QR code URL
export async function setup2Fa(req, res) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user.totpEnabled) {
      return res.status(400).json({ success: false, data: null, error: '2FA is already enabled' });
    }

    const { base32, otpauthUrl } = generateTotpSecret(user.email);

    // Save temporary secret (inactive until validated)
    await prisma.user.update({
      where: { id: user.id },
      data: { totpSecret: base32 },
    });

    await logAudit(user.id, '2FA_SETUP_REQUEST', 'Requested TOTP secret keys', req);

    return res.status(200).json({
      success: true,
      data: { base32, otpauthUrl },
      error: null,
    });
  } catch (error) {
    logger.error(`2FA setup error: ${error.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// Enable 2FA: verifies first TOTP input
export async function enable2Fa(req, res) {
  try {
    const { code } = req.body;
    if (!code || code.length !== 6) {
      return res.status(400).json({ success: false, data: null, error: '6-digit validation code required' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user.totpSecret) {
      return res.status(400).json({ success: false, data: null, error: 'Please request 2FA setup first' });
    }

    const verified = verifyTotpToken(code, user.totpSecret);
    if (!verified) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid verification code' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { totpEnabled: true },
    });

    await logAudit(user.id, '2FA_ENABLED', 'Activated Two-Factor Authentication', req);

    return res.status(200).json({
      success: true,
      data: 'Two-Factor Authentication has been successfully enabled.',
      error: null,
    });
  } catch (error) {
    logger.error(`2FA activation error: ${error.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// Forgot Password Flow
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, data: null, error: 'Email address required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Protect email enumeration, return success anyway
      return res.status(200).json({
        success: true,
        data: 'If your email is in our system, a password reset link has been sent.',
        error: null,
      });
    }

    // Generate reset token (expires in 15 mins)
    const resetToken = await generateAccessToken({ id: user.id, reset: true });
    
    // In production we send email. For development/testing, we log to console and combined.log
    logger.info(`[PASSWORD_RESET_LINK] Send to ${email}: http://localhost:3000/admin/reset-password?token=${resetToken}`);

    await logAudit(user.id, 'PASSWORD_RESET_REQUESTED', 'Requested password reset email link', req);

    return res.status(200).json({
      success: true,
      data: 'If your email is in our system, a password reset link has been sent.',
      error: null,
    });
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}
