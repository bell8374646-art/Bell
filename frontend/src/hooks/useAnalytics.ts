// useAnalytics.ts
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { publicApi } from '@/utils/api';

// Simple session token generator
function getSessionToken() {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem('bell_coin_session');
  if (!token) {
    token = 'session-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
    sessionStorage.setItem('bell_coin_session', token);
  }
  return token;
}

function getBrowserAndDevice() {
  if (typeof window === 'undefined') return { browser: 'Unknown', device: 'Desktop' };
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  let device = 'Desktop';

  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';

  if (/Mobi|Android|iPhone/i.test(ua)) {
    device = 'Mobile';
  } else if (/Tablet|iPad/i.test(ua)) {
    device = 'Tablet';
  }

  return { browser, device };
}

export function useAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Log page view event
    const sessionToken = getSessionToken();
    const { browser, device } = getBrowserAndDevice();
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    publicApi.logAnalyticsEvent({
      eventName: 'page_view',
      page: pathname,
      referrer,
      browser,
      device,
      sessionToken,
    }).catch(() => {
      // Ignore background analytics logging errors
    });
  }, [pathname]);

  const logAction = (eventName: string, metadata?: any) => {
    const sessionToken = getSessionToken();
    const { browser, device } = getBrowserAndDevice();

    publicApi.logAnalyticsEvent({
      eventName,
      page: pathname,
      browser,
      device,
      sessionToken,
      metadata,
    }).catch(() => {
      // Ignore background analytics logging errors
    });
  };

  return { logAction };
}
