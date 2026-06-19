// api.ts
// API integration utilities connecting Next.js to the Express backend

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

let cachedAccessToken: string | null = null;

export function setAccessToken(token: string | null) {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
}

export function getAccessToken(): string | null {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    cachedAccessToken = localStorage.getItem('accessToken');
  }
  return cachedAccessToken;
}

interface RequestOptions extends RequestInit {
  token?: string;
  skipAuth?: boolean;
}

export async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!options.headers) {
    headers.set('Content-Type', 'application/json');
  }

  // Inject access token unless skipped
  const token = getAccessToken();
  if (token && !options.skipAuth) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  // If token expired (403/401) and we have refresh capability, we handle it
  if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined' && !options.skipAuth) {
    // Attempt token refresh
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const refreshData = await refreshRes.json();
      if (refreshData.success && refreshData.data?.accessToken) {
        setAccessToken(refreshData.data.accessToken);
        // Retry initial request with new token
        headers.set('Authorization', `Bearer ${refreshData.data.accessToken}`);
        const retryRes = await fetch(url, { ...config, headers });
        const retryJson = await retryRes.json();
        if (retryJson.success) return retryJson.data;
        throw new Error(retryJson.error || 'Request failed');
      } else {
        // Clear tokens
        setAccessToken(null);
      }
    } catch (err) {
      setAccessToken(null);
    }
  }

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}

// ==========================================
// PUBLIC API CALLS
// ==========================================

export const publicApi = {
  getPage: (slug: string) => request<any>(`/pages/${slug}`),
  getBlogs: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<any[]>(`/blog?${query}`);
  },
  getBlogPost: (slug: string) => request<any>(`/blog/${slug}`),
  getCategories: () => request<any[]>(`/categories`),
  getTeam: () => request<any[]>(`/team`),
  getRoadmap: () => request<any[]>(`/roadmap`),
  getFaq: () => request<any[]>(`/faq`),
  getAnnouncements: () => request<any[]>(`/announcements`),
  getCryptoSettings: () => request<any>(`/crypto`),
  subscribeNewsletter: (data: { email: string; firstName?: string; source?: string }) =>
    request<string>('/newsletter/subscribe', { method: 'POST', body: JSON.stringify(data) }),
  submitContactForm: (data: { name: string; email: string; subject: string; message: string; honeypot?: string }) =>
    request<any>('/contact/submit', { method: 'POST', body: JSON.stringify(data) }),
  logAnalyticsEvent: (data: {
    eventName: string;
    page: string;
    referrer?: string;
    browser?: string;
    device?: string;
    country?: string;
    sessionToken?: string;
    metadata?: any;
  }) => request<any>('/analytics/event', { method: 'POST', body: JSON.stringify(data) }),
};

// ==========================================
// SECURE ADMIN API CALLS
// ==========================================

export const adminApi = {
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
  verify2Fa: (data: any) => request<any>('/auth/verify-2fa', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
  logout: () => request<string>('/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) => request<string>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }), skipAuth: true }),
  
  // 2FA management
  setup2Fa: () => request<any>('/admin/auth/setup-2fa'),
  enable2Fa: (code: string) => request<string>('/admin/auth/enable-2fa', { method: 'POST', body: JSON.stringify({ code }) }),

  // Page layouts
  updatePage: (slug: string, data: any) => request<any>(`/pages/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Blog
  createBlogPost: (data: any) => request<any>('/blog', { method: 'POST', body: JSON.stringify(data) }),
  updateBlogPost: (id: string, data: any) => request<any>(`/blog/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBlogPost: (id: string) => request<any>(`/blog/${id}`, { method: 'DELETE' }),
  createCategory: (name: string) => request<any>('/categories', { method: 'POST', body: JSON.stringify({ name }) }),

  // Team
  createTeamMember: (data: any) => request<any>('/team', { method: 'POST', body: JSON.stringify(data) }),
  updateTeamMember: (id: string, data: any) => request<any>(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTeamMember: (id: string) => request<any>(`/team/${id}`, { method: 'DELETE' }),

  // Roadmap
  createRoadmapPhase: (data: any) => request<any>('/roadmap', { method: 'POST', body: JSON.stringify(data) }),
  updateRoadmapPhase: (id: string, data: any) => request<any>(`/roadmap/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRoadmapPhase: (id: string) => request<any>(`/roadmap/${id}`, { method: 'DELETE' }),

  // FAQ
  createFaqItem: (data: any) => request<any>('/faq', { method: 'POST', body: JSON.stringify(data) }),
  updateFaqItem: (id: string, data: any) => request<any>(`/faq/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFaqItem: (id: string) => request<any>(`/faq/${id}`, { method: 'DELETE' }),

  // Announcements
  createAnnouncement: (data: any) => request<any>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  updateAnnouncement: (id: string, data: any) => request<any>(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAnnouncement: (id: string) => request<any>(`/announcements/${id}`, { method: 'DELETE' }),

  // Contacts
  getContactMessages: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any[]>(`/admin/contact/messages?${query}`);
  },
  updateMessageStatus: (id: string, data: any) => request<any>(`/admin/contact/messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  replyMessage: (id: string, replyText: string) => request<any>(`/admin/contact/messages/${id}/reply`, { method: 'POST', body: JSON.stringify({ replyText }) }),
  getContactExportUrl: () => `${API_BASE}/admin/contact/messages/export?token=${getAccessToken()}`,

  // Newsletter
  getSubscribers: () => request<any[]>('/admin/newsletter/subscribers'),
  getNewsletterExportUrl: () => `${API_BASE}/admin/newsletter/subscribers/export?token=${getAccessToken()}`,

  // Crypto Setting
  updateCryptoSettings: (data: any) => request<any>('/admin/crypto', { method: 'PUT', body: JSON.stringify(data) }),

  // Media
  uploadMedia: (file: File, folder: string = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return request<any>('/admin/media/upload', {
      method: 'POST',
      body: formData,
      headers: new Headers(), // browser generates boundary for FormData automatically
    });
  },
  getMedia: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return request<any[]>(`/admin/media?${query}`);
  },
  deleteMedia: (id: string) => request<any>(`/admin/media/${id}`, { method: 'DELETE' }),

  // Reports
  getAnalyticsReport: () => request<any>('/admin/analytics/report'),
};
