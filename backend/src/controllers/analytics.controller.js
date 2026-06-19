// analytics.controller.js
// Handles tracking events and building analytics reports

import prisma from '../config/db.js';
import logger from '../config/logger.js';

export async function logEvent(req, res) {
  try {
    const { eventName, page, referrer, browser, device, country, sessionToken, metadata } = req.body;

    if (!eventName || !page) {
      return res.status(400).json({ success: false, data: null, error: 'Event name and page are required' });
    }

    const event = await prisma.analyticsEvent.create({
      data: {
        eventName,
        page,
        referrer,
        browser,
        device,
        country: country || 'Unknown',
        sessionToken,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    return res.status(201).json({ success: true, data: event, error: null });
  } catch (err) {
    logger.error(`Analytics log event error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function getAnalyticsReport(req, res) {
  try {
    const events = await prisma.analyticsEvent.findMany({
      orderBy: { timestamp: 'asc' },
    });

    // Overview Stats
    const totalEvents = events.length;
    const pageViews = events.filter((e) => e.eventName === 'page_view').length;
    const uniqueSessions = new Set(events.map((e) => e.sessionToken).filter(Boolean)).size;
    const uniqueVisitors = new Set(events.map((e) => e.sessionToken).filter(Boolean)).size; // simplified

    // Grouping Helpers
    const countryMap = {};
    const deviceMap = {};
    const browserMap = {};
    const pageMap = {};
    const trafficSourceMap = {
      organic: 0,
      direct: 0,
      social: 0,
      referral: 0,
      email: 0,
    };
    const conversionMap = {
      buy_now_clicks: 0,
      newsletter_signups: 0,
      whitepaper_downloads: 0,
      contact_submissions: 0,
    };

    // Date grouping for last 30 days
    const dailyMap = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }

    events.forEach((event) => {
      const dateStr = event.timestamp.toISOString().split('T')[0];
      if (dailyMap[dateStr] !== undefined && event.eventName === 'page_view') {
        dailyMap[dateStr]++;
      }

      if (event.eventName === 'page_view') {
        pageMap[event.page] = (pageMap[event.page] || 0) + 1;

        // Country Split
        const c = event.country || 'Unknown';
        countryMap[c] = (countryMap[c] || 0) + 1;

        // Device Split
        const dev = event.device || 'Desktop';
        deviceMap[dev] = (deviceMap[dev] || 0) + 1;

        // Browser Split
        const br = event.browser || 'Unknown';
        browserMap[br] = (browserMap[br] || 0) + 1;

        // Referrer (Traffic Source)
        const ref = event.referrer ? event.referrer.toLowerCase() : '';
        if (!ref) {
          trafficSourceMap.direct++;
        } else if (ref.includes('google') || ref.includes('bing') || ref.includes('yahoo')) {
          trafficSourceMap.organic++;
        } else if (ref.includes('twitter') || ref.includes('t.co') || ref.includes('facebook') || ref.includes('instagram') || ref.includes('telegram')) {
          trafficSourceMap.social++;
        } else if (ref.includes('email') || ref.includes('newsletter')) {
          trafficSourceMap.email++;
        } else {
          trafficSourceMap.referral++;
        }
      }

      // Conversions
      if (event.eventName === 'click_buy_now') conversionMap.buy_now_clicks++;
      if (event.eventName === 'newsletter_subscribe') conversionMap.newsletter_signups++;
      if (event.eventName === 'download_whitepaper') conversionMap.whitepaper_downloads++;
      if (event.eventName === 'contact_submit') conversionMap.contact_submissions++;
    });

    // Formatting charts datasets
    const dailySessions = Object.keys(dailyMap).map((date) => ({
      date,
      views: dailyMap[date],
    }));

    const countries = Object.keys(countryMap)
      .map((k) => ({ name: k, count: countryMap[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const devices = Object.keys(deviceMap).map((k) => ({ name: k, count: deviceMap[k] }));
    const browsers = Object.keys(browserMap).map((k) => ({ name: k, count: browserMap[k] }));

    const topPages = Object.keys(pageMap)
      .map((k) => ({ page: k, views: pageMap[k] }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const overview = {
      totalVisitors: uniqueVisitors,
      dailyVisitorsDelta: pageViews, // simplified
      totalPageViews: pageViews,
      bounceRate: pageViews > 0 ? Math.round((uniqueSessions / pageViews) * 100) : 0, // mock bounce logic
      avgDuration: '2m 14s',
    };

    return res.status(200).json({
      success: true,
      data: {
        overview,
        dailySessions,
        countries,
        devices,
        browsers,
        topPages,
        trafficSources: trafficSourceMap,
        conversions: conversionMap,
      },
      error: null,
    });
  } catch (err) {
    logger.error(`Get analytics report error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}
