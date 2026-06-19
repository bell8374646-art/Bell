// security.middleware.js
// Rate limiters and slow-downs for API endpoints

import { rateLimit } from 'express-rate-limit';
import { slowDown } from 'express-slow-down';

// General rate limiter: max 200 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

// Stricter auth rate limiter: max 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    data: null,
    error: 'Too many failed login attempts. Account auth rate-limited, please try again in 15 minutes.',
  },
});

// Slow down response for repeated login attempts
export const authSlowDown = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 2, // Allow 2 attempts without delay
  delayMs: (hits) => hits * 500, // Add 500ms delay per hit after the 2nd
});
