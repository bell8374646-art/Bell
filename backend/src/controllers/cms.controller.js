// cms.controller.js
// Handles CRUD for pages, blog, team, roadmap, FAQ, and announcements

import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';
import prisma from '../config/db.js';
import logger from '../config/logger.js';

// Setup DOMPurify on the backend
const domWindow = new JSDOM('').window;
const DOMPurify = createDOMPurify(domWindow);

const cleanHtml = (dirty) => {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty);
};

const makeSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const getReadingTime = (text) => {
  const wpm = 200;
  const wordCount = text ? text.trim().split(/\s+/).length : 0;
  return Math.ceil(wordCount / wpm) || 1;
};

// ==========================================
// PAGES CONTENT
// ==========================================

export async function getPage(req, res) {
  try {
    const { slug } = req.params;
    const page = await prisma.pageContent.findUnique({ where: { slug } });
    if (!page) {
      return res.status(404).json({ success: false, data: null, error: `Page ${slug} not found` });
    }
    return res.status(200).json({ success: true, data: page, error: null });
  } catch (err) {
    logger.error(`Get page error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function updatePage(req, res) {
  try {
    const { slug } = req.params;
    const { title, content, isPublished } = req.body;

    const page = await prisma.pageContent.upsert({
      where: { slug },
      update: {
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        isPublished,
        updatedBy: req.user.email,
      },
      create: {
        slug,
        title,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        isPublished,
        updatedBy: req.user.email,
      },
    });

    return res.status(200).json({ success: true, data: page, error: null });
  } catch (err) {
    logger.error(`Update page error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ==========================================
// BLOG POSTS & CATEGORIES
// ==========================================

export async function getBlogPosts(req, res) {
  try {
    const { category, search, status } = req.query;
    
    // Default: public users only see PUBLISHED posts
    let postStatus = 'PUBLISHED';
    if (req.user && status) {
      postStatus = status; // Admins can filter by draft/scheduled
    }

    const where = {};
    if (postStatus !== 'ALL') {
      where.status = postStatus;
    }
    if (category) {
      where.category = { slug: category };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const posts = await prisma.blogPost.findMany({
      where,
      include: {
        category: true,
        author: { select: { email: true, role: true } },
      },
      orderBy: { publishAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: posts, error: null });
  } catch (err) {
    logger.error(`Get blogs error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function getBlogPostBySlug(req, res) {
  try {
    const { slug } = req.params;
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { email: true, role: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, data: null, error: 'Post not found' });
    }

    return res.status(200).json({ success: true, data: post, error: null });
  } catch (err) {
    logger.error(`Get blog post error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function createBlogPost(req, res) {
  try {
    const { title, content, excerpt, metaTitle, metaDesc, ogImage, canonicalUrl, focusKeyword, status, categoryId, publishAt } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, data: null, error: 'Title and content are required' });
    }

    const slug = makeSlug(title);
    const sanitizedContent = cleanHtml(content);
    const readingTime = getReadingTime(content);

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content: sanitizedContent,
        excerpt,
        metaTitle: metaTitle || title,
        metaDesc,
        ogImage,
        canonicalUrl,
        focusKeyword,
        status: status || 'DRAFT',
        publishAt: publishAt ? new Date(publishAt) : new Date(),
        readingTime,
        categoryId,
        authorId: req.user.id,
      },
    });

    return res.status(201).json({ success: true, data: post, error: null });
  } catch (err) {
    logger.error(`Create blog error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function updateBlogPost(req, res) {
  try {
    const { id } = req.params;
    const { title, content, excerpt, metaTitle, metaDesc, ogImage, canonicalUrl, focusKeyword, status, categoryId, publishAt, featured } = req.body;

    const postExists = await prisma.blogPost.findUnique({ where: { id } });
    if (!postExists) {
      return res.status(404).json({ success: false, data: null, error: 'Blog post not found' });
    }

    const data = {};
    if (title) {
      data.title = title;
      data.slug = makeSlug(title);
    }
    if (content) {
      data.content = cleanHtml(content);
      data.readingTime = getReadingTime(content);
    }
    if (excerpt !== undefined) data.excerpt = excerpt;
    if (metaTitle !== undefined) data.metaTitle = metaTitle;
    if (metaDesc !== undefined) data.metaDesc = metaDesc;
    if (ogImage !== undefined) data.ogImage = ogImage;
    if (canonicalUrl !== undefined) data.canonicalUrl = canonicalUrl;
    if (focusKeyword !== undefined) data.focusKeyword = focusKeyword;
    if (status !== undefined) data.status = status;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (featured !== undefined) data.featured = featured;
    if (publishAt) data.publishAt = new Date(publishAt);

    const post = await prisma.blogPost.update({
      where: { id },
      data,
    });

    return res.status(200).json({ success: true, data: post, error: null });
  } catch (err) {
    logger.error(`Update blog error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function deleteBlogPost(req, res) {
  try {
    const { id } = req.params;
    await prisma.blogPost.delete({ where: { id } });
    return res.status(200).json({ success: true, data: 'Post deleted successfully', error: null });
  } catch (err) {
    logger.error(`Delete blog error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// Blog Categories
export async function getCategories(req, res) {
  try {
    const categories = await prisma.blogCategory.findMany({
      include: { _count: { select: { posts: true } } },
    });
    return res.status(200).json({ success: true, data: categories, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, data: null, error: 'Category name is required' });

    const slug = makeSlug(name);
    const category = await prisma.blogCategory.create({
      data: { name, slug },
    });
    return res.status(201).json({ success: true, data: category, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ==========================================
// ROADMAP PHASES
// ==========================================

export async function getRoadmap(req, res) {
  try {
    const phases = await prisma.roadmapPhase.findMany({
      orderBy: { order: 'asc' },
    });
    return res.status(200).json({ success: true, data: phases, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function createRoadmapPhase(req, res) {
  try {
    const { title, date, progress, status, milestones, order } = req.body;
    const phase = await prisma.roadmapPhase.create({
      data: {
        title,
        date,
        progress: Number(progress) || 0,
        status: status || 'UPCOMING',
        milestones: typeof milestones === 'string' ? milestones : JSON.stringify(milestones || []),
        order: Number(order) || 0,
      },
    });
    return res.status(201).json({ success: true, data: phase, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function updateRoadmapPhase(req, res) {
  try {
    const { id } = req.params;
    const { title, date, progress, status, milestones, order } = req.body;
    const phase = await prisma.roadmapPhase.update({
      where: { id },
      data: {
        title,
        date,
        progress: progress !== undefined ? Number(progress) : undefined,
        status,
        milestones: typeof milestones === 'string' ? milestones : (milestones ? JSON.stringify(milestones) : undefined),
        order: order !== undefined ? Number(order) : undefined,
      },
    });
    return res.status(200).json({ success: true, data: phase, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function deleteRoadmapPhase(req, res) {
  try {
    const { id } = req.params;
    await prisma.roadmapPhase.delete({ where: { id } });
    return res.status(200).json({ success: true, data: 'Roadmap phase deleted', error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ==========================================
// FAQ ITEMS
// ==========================================

export async function getFaqItems(req, res) {
  try {
    const faqs = await prisma.faqItem.findMany({
      orderBy: { order: 'asc' },
    });
    return res.status(200).json({ success: true, data: faqs, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function createFaqItem(req, res) {
  try {
    const { question, answer, category, order } = req.body;
    const faq = await prisma.faqItem.create({
      data: {
        question,
        answer,
        category: category || 'GENERAL',
        order: Number(order) || 0,
      },
    });
    return res.status(201).json({ success: true, data: faq, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function updateFaqItem(req, res) {
  try {
    const { id } = req.params;
    const { question, answer, category, order } = req.body;
    const faq = await prisma.faqItem.update({
      where: { id },
      data: {
        question,
        answer,
        category,
        order: order !== undefined ? Number(order) : undefined,
      },
    });
    return res.status(200).json({ success: true, data: faq, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function deleteFaqItem(req, res) {
  try {
    const { id } = req.params;
    await prisma.faqItem.delete({ where: { id } });
    return res.status(200).json({ success: true, data: 'FAQ item deleted', error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ==========================================
// TEAM MEMBERS
// ==========================================

export async function getTeamMembers(req, res) {
  try {
    const team = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
    });
    return res.status(200).json({ success: true, data: team, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function createTeamMember(req, res) {
  try {
    const { name, title, bio, photoUrl, linkedin, twitter, telegram, order, type } = req.body;
    const member = await prisma.teamMember.create({
      data: {
        name,
        title,
        bio,
        photoUrl,
        linkedin,
        twitter,
        telegram,
        order: Number(order) || 0,
        type: type || 'CORE',
      },
    });
    return res.status(201).json({ success: true, data: member, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function updateTeamMember(req, res) {
  try {
    const { id } = req.params;
    const { name, title, bio, photoUrl, linkedin, twitter, telegram, order, type } = req.body;
    const member = await prisma.teamMember.update({
      where: { id },
      data: {
        name,
        title,
        bio,
        photoUrl,
        linkedin,
        twitter,
        telegram,
        order: order !== undefined ? Number(order) : undefined,
        type,
      },
    });
    return res.status(200).json({ success: true, data: member, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function deleteTeamMember(req, res) {
  try {
    const { id } = req.params;
    await prisma.teamMember.delete({ where: { id } });
    return res.status(200).json({ success: true, data: 'Team member deleted', error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

// ==========================================
// ANNOUNCEMENTS
// ==========================================

export async function getAnnouncements(req, res) {
  try {
    const filter = {};
    if (!req.user) {
      filter.active = true; // Public users only see active announcements
    }
    const announcements = await prisma.announcement.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: announcements, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function createAnnouncement(req, res) {
  try {
    const { type, title, content, ctaText, ctaUrl, color, active, startsAt, endsAt, cookieDismissDays, pageTargeting } = req.body;
    const announcement = await prisma.announcement.create({
      data: {
        type: type || 'BANNER',
        title,
        content,
        ctaText,
        ctaUrl,
        color: color || '#D4AF37',
        active: active || false,
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
        cookieDismissDays: Number(cookieDismissDays) || 7,
        pageTargeting: pageTargeting || '*',
      },
    });
    return res.status(201).json({ success: true, data: announcement, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const { id } = req.params;
    const { type, title, content, ctaText, ctaUrl, color, active, startsAt, endsAt, cookieDismissDays, pageTargeting } = req.body;
    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        type,
        title,
        content,
        ctaText,
        ctaUrl,
        color,
        active,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
        cookieDismissDays: cookieDismissDays !== undefined ? Number(cookieDismissDays) : undefined,
        pageTargeting,
      },
    });
    return res.status(200).json({ success: true, data: announcement, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id } });
    return res.status(200).json({ success: true, data: 'Announcement deleted', error: null });
  } catch (err) {
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}
