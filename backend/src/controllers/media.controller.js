// media.controller.js
// Handles file uploads, storage, search and cleanup

import fs from 'fs';
import path from 'path';
import multer from 'multer';
import prisma from '../config/db.js';
import logger from '../config/logger.js';

const UPLOAD_DIR = 'uploads';

// Initialize upload directory
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

export const multerUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

export async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, data: null, error: 'No file uploaded' });
    }

    const { filename, size, mimetype } = req.file;
    const originalName = req.body.name || req.file.originalname;
    const folder = req.body.folder || 'general';

    // In a real production setup we would upload to S3/Cloudinary.
    // For local development, we serve from the /uploads static endpoint.
    const fileUrl = `http://localhost:5000/uploads/${filename}`;

    const media = await prisma.mediaFile.create({
      data: {
        url: fileUrl,
        key: filename,
        name: originalName,
        size: size,
        mimeType: mimetype,
        folder: folder,
      },
    });

    logger.info(`Uploaded file: ${originalName} (${size} bytes)`);

    return res.status(201).json({ success: true, data: media, error: null });
  } catch (err) {
    logger.error(`Media upload error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function getMediaFiles(req, res) {
  try {
    const { search, folder } = req.query;

    const where = {};
    if (folder) where.folder = folder;
    if (search) {
      where.name = { contains: search };
    }

    const files = await prisma.mediaFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: files, error: null });
  } catch (err) {
    logger.error(`Get media files error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function deleteMediaFile(req, res) {
  try {
    const { id } = req.params;
    const file = await prisma.mediaFile.findUnique({ where: { id } });

    if (!file) {
      return res.status(404).json({ success: false, data: null, error: 'Media file not found' });
    }

    // Attempt to delete physical file from local uploads folder
    const filePath = path.join(UPLOAD_DIR, file.key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await prisma.mediaFile.delete({ where: { id } });

    logger.info(`Deleted media file: ${file.name}`);

    return res.status(200).json({ success: true, data: 'Media deleted successfully', error: null });
  } catch (err) {
    logger.error(`Delete media file error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}
