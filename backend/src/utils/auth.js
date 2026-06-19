// auth.js
// Authentication, JWT, and TOTP helper utilities

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import speakeasy from 'speakeasy';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'bell-coin-enterprise-premium-secret-key-32-chars');
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET || 'bell-coin-enterprise-premium-refresh-key-32-chars');

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Sign JWT Access Token (15 min)
export async function generateAccessToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

// Sign JWT Refresh Token (7 days)
export async function generateRefreshToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

// Verify JWT Access Token
export async function verifyAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

// Verify JWT Refresh Token
export async function verifyRefreshToken(token) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

// Generate TOTP Secret (for Google Authenticator)
export function generateTotpSecret(email) {
  const secret = speakeasy.generateSecret({
    name: `Bell Coin (${email})`,
    issuer: 'Bell Coin',
  });
  return {
    otpauthUrl: secret.otpauth_url,
    base32: secret.base32,
  };
}

// Verify TOTP token
export function verifyTotpToken(token, secretBase32) {
  return speakeasy.totp.verify({
    secret: secretBase32,
    encoding: 'base32',
    token: token,
    window: 2, // 2 steps tolerance (earlier, current, next)
  });
}
