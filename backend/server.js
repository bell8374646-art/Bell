// server.js
// Main entry point for the Bell Coin Express server

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import logger from './src/config/logger.js';
import router from './src/routes/index.js';
import { generalLimiter } from './src/middleware/security.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'http://localhost:5000', 'https://images.unsplash.com'],
        connectSrc: ["'self'", 'https://api.coingecko.com'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // needed to serve uploaded images cross-origin
  })
);

// CORS configuration (allow localhost frontend)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local media files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logger middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Mount general rate limiter to public endpoints
app.use('/api/v1', generalLimiter, router);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', timestamp: new Date() });
});

// Global 404 Route
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Unhandle error: ${err.message}\nStack: ${err.stack}`);
  res.status(err.status || 500).json({
    success: false,
    data: null,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

app.listen(PORT, () => {
  logger.info(`Bell Coin Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
