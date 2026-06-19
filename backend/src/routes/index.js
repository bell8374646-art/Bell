// index.js
// Express API Router registering public and protected routes

import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { authLimiter, authSlowDown } from '../middleware/security.middleware.js';

import {
  login,
  verify2Fa,
  refresh,
  logout,
  setup2Fa,
  enable2Fa,
  forgotPassword,
} from '../controllers/auth.controller.js';

import {
  getPage,
  updatePage,
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getCategories,
  createCategory,
  getRoadmap,
  createRoadmapPhase,
  updateRoadmapPhase,
  deleteRoadmapPhase,
  getFaqItems,
  createFaqItem,
  updateFaqItem,
  deleteFaqItem,
  getTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/cms.controller.js';

import {
  submitContactForm,
  getContactMessages,
  updateContactMessageStatus,
  replyToMessage,
  exportContactMessagesCsv,
  subscribeNewsletter,
  confirmSubscription,
  getSubscribers,
  exportSubscribersCsv,
} from '../controllers/contact.controller.js';

import { logEvent, getAnalyticsReport } from '../controllers/analytics.controller.js';
import { getCryptoSettings, updateCryptoSettings } from '../controllers/crypto.controller.js';
import { uploadFile, getMediaFiles, deleteMediaFile, multerUpload } from '../controllers/media.controller.js';

const router = Router();

// ==========================================
// PUBLIC ENDPOINTS (NO AUTH)
// ==========================================

// CMS Content Fetching
router.get('/pages/:slug', getPage);
router.get('/blog', getBlogPosts);
router.get('/blog/:slug', getBlogPostBySlug);
router.get('/categories', getCategories);
router.get('/team', getTeamMembers);
router.get('/faq', getFaqItems);
router.get('/roadmap', getRoadmap);
router.get('/announcements', getAnnouncements);
router.get('/crypto', getCryptoSettings);

// Forms & Subscriptions
router.post('/newsletter/subscribe', subscribeNewsletter);
router.get('/newsletter/confirm', confirmSubscription);
router.post('/contact/submit', submitContactForm);

// Self-Hosted Analytics
router.post('/analytics/event', logEvent);

// Authentication Entry Points
router.post('/auth/login', authLimiter, authSlowDown, login);
router.post('/auth/verify-2fa', authLimiter, verify2Fa);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);
router.post('/auth/forgot-password', forgotPassword);

// ==========================================
// ADMIN ENDPOINTS (AUTHENTICATED)
// ==========================================
router.use(authenticateToken);

// 2FA Admin Setup
router.get('/admin/auth/setup-2fa', setup2Fa);
router.post('/admin/auth/enable-2fa', enable2Fa);

// Page CMS Content (Admin Level 3+)
router.put('/pages/:slug', requireRole('ADMIN'), updatePage);

// Blog Management (Editor Level 2+)
router.post('/blog', requireRole('EDITOR'), createBlogPost);
router.put('/blog/:id', requireRole('EDITOR'), updateBlogPost);
router.delete('/blog/:id', requireRole('EDITOR'), deleteBlogPost);
router.post('/categories', requireRole('ADMIN'), createCategory);

// Team Members (Editor Level 2+)
router.post('/team', requireRole('EDITOR'), createTeamMember);
router.put('/team/:id', requireRole('EDITOR'), updateTeamMember);
router.delete('/team/:id', requireRole('EDITOR'), deleteTeamMember);

// Roadmap Phases (Editor Level 2+)
router.post('/roadmap', requireRole('EDITOR'), createRoadmapPhase);
router.put('/roadmap/:id', requireRole('EDITOR'), updateRoadmapPhase);
router.delete('/roadmap/:id', requireRole('EDITOR'), deleteRoadmapPhase);

// FAQ Items (Editor Level 2+)
router.post('/faq', requireRole('EDITOR'), createFaqItem);
router.put('/faq/:id', requireRole('EDITOR'), updateFaqItem);
router.delete('/faq/:id', requireRole('EDITOR'), deleteFaqItem);

// Announcements (Moderator Level 1+)
router.post('/announcements', requireRole('MODERATOR'), createAnnouncement);
router.put('/announcements/:id', requireRole('MODERATOR'), updateAnnouncement);
router.delete('/announcements/:id', requireRole('MODERATOR'), deleteAnnouncement);

// Contact messages inbox (Moderator Level 1+)
router.get('/admin/contact/messages', requireRole('MODERATOR'), getContactMessages);
router.get('/admin/contact/messages/export', requireRole('MODERATOR'), exportContactMessagesCsv);
router.put('/admin/contact/messages/:id', requireRole('MODERATOR'), updateContactMessageStatus);
router.post('/admin/contact/messages/:id/reply', requireRole('MODERATOR'), replyToMessage);

// Newsletter subscribers (Admin Level 3+)
router.get('/admin/newsletter/subscribers', requireRole('ADMIN'), getSubscribers);
router.get('/admin/newsletter/subscribers/export', requireRole('ADMIN'), exportSubscribersCsv);

// Crypto Settings (Admin Level 3+)
router.put('/admin/crypto', requireRole('ADMIN'), updateCryptoSettings);

// Media Manager (Editor Level 2+)
router.post('/admin/media/upload', requireRole('EDITOR'), multerUpload.single('file'), uploadFile);
router.get('/admin/media', requireRole('EDITOR'), getMediaFiles);
router.delete('/admin/media/:id', requireRole('EDITOR'), deleteMediaFile);

// Self-Hosted Analytics Report (Moderator Level 1+)
router.get('/admin/analytics/report', requireRole('MODERATOR'), getAnalyticsReport);

export default router;
