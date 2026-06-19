// contact.controller.js
// Handles newsletter registration, confirmation, contact form, and CSV exports

import { z } from 'zod';
import prisma from '../config/db.js';
import logger from '../config/logger.js';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(5),
  honeypot: z.string().optional(), // Bot honeypot field
});

const subscribeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().optional(),
  source: z.string().optional(),
});

// ==========================================
// CONTACT MESSAGES
// ==========================================

export async function submitContactForm(req, res) {
  try {
    const body = contactSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid message form data' });
    }

    const { name, email, subject, message, honeypot } = body.data;

    // Honeypot spam check: if filled, quietly reject or mock success
    if (honeypot) {
      logger.warn(`Spam bot contact submission detected from IP: ${req.ip}`);
      return res.status(200).json({ success: true, data: 'Submission received' });
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        ip: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        status: 'NEW',
      },
    });

    logger.info(`New contact message submitted by ${email}: "${subject}"`);
    return res.status(201).json({ success: true, data: newMessage, error: null });
  } catch (err) {
    logger.error(`Contact form submission error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function getContactMessages(req, res) {
  try {
    const { status, starred } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (starred) filter.starred = starred === 'true';

    const messages = await prisma.contactMessage.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: messages, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function updateContactMessageStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, starred } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (starred !== undefined) updateData.starred = starred;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    });
    return res.status(200).json({ success: true, data: updated, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function replyToMessage(req, res) {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    if (!replyText || replyText.trim() === '') {
      return res.status(400).json({ success: false, data: null, error: 'Reply content required' });
    }

    const msg = await prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) return res.status(404).json({ success: false, data: null, error: 'Message not found' });

    // Mock send email
    logger.info(`[SMTP_EMAIL] Replying to ${msg.email} (Subject: Re: ${msg.subject}):\n${replyText}`);

    // Update status to RESOLVED
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: 'RESOLVED' },
    });

    return res.status(200).json({ success: true, data: updated, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function exportContactMessagesCsv(req, res) {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Status', 'Starred', 'IP', 'CreatedAt'];
    const escapeCsv = (str) => `"${str.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;

    const csvLines = [
      headers.join(','),
      ...messages.map((m) =>
        [
          m.id,
          escapeCsv(m.name),
          escapeCsv(m.email),
          escapeCsv(m.subject),
          escapeCsv(m.message),
          m.status,
          m.starred,
          m.ip,
          m.createdAt.toISOString(),
        ].join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contact_messages.csv"');
    return res.status(200).send(csvLines.join('\n'));
  } catch (err) {
    logger.error(`CSV export error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ==========================================
// NEWSLETTER
// ==========================================

export async function subscribeNewsletter(req, res) {
  try {
    const body = subscribeSchema.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid email address' });
    }

    const { email, firstName, source } = body.data;

    // Check if already registered
    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
    if (existing) {
      if (existing.confirmed) {
        return res.status(400).json({ success: false, data: null, error: 'Email already subscribed' });
      }
      return res.status(200).json({
        success: true,
        data: 'A confirmation link has already been sent to your email. Please confirm your subscription.',
        error: null,
      });
    }

    // Generate double opt-in confirmation token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName,
        source: source || 'footer',
        confirmed: false,
        confirmationToken: token,
      },
    });

    // In production we send email with confirmation link. In development, we log it.
    logger.info(`[SMTP_EMAIL] Send newsletter confirmation to ${email}:\nClick here to confirm: http://localhost:3000/api/v1/newsletter/confirm?token=${token}`);

    return res.status(200).json({
      success: true,
      data: 'Please check your email to confirm your subscription.',
      error: null,
    });
  } catch (err) {
    logger.error(`Subscribe error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function confirmSubscription(req, res) {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, data: null, error: 'Token is required' });

    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { confirmationToken: token },
    });

    if (!subscriber) {
      return res.status(400).json({ success: false, data: null, error: 'Invalid or expired confirmation token' });
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        confirmed: true,
        confirmationToken: null,
      },
    });

    logger.info(`Newsletter subscription confirmed for: ${subscriber.email}`);
    // Redirect or send HTML page confirming success
    return res.status(200).send('<h1>Subscription Confirmed!</h1><p>Thank you for subscribing to Bell Coin newsletter. You can now close this tab.</p>');
  } catch (err) {
    logger.error(`Confirm subscribe error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function getSubscribers(req, res) {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: subscribers, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function exportSubscribersCsv(req, res) {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['ID', 'Email', 'FirstName', 'Source', 'Confirmed', 'CreatedAt'];
    const escapeCsv = (str) => `"${str.replace(/"/g, '""')}"`;

    const csvLines = [
      headers.join(','),
      ...subscribers.map((s) =>
        [
          s.id,
          escapeCsv(s.email),
          escapeCsv(s.firstName || ''),
          escapeCsv(s.source),
          s.confirmed,
          s.createdAt.toISOString(),
        ].join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="newsletter_subscribers.csv"');
    return res.status(200).send(csvLines.join('\n'));
  } catch (err) {
    logger.error(`Subscribers CSV export error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}
