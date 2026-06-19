// page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconBell,
  IconSettings,
  IconChartBar,
  IconHelp,
  IconMap,
  IconLogout,
  IconLoader2,
  IconAlertCircle,
  IconPlus,
  IconTrash,
  IconEdit,
  IconTrendingUp,
  IconCheck,
  IconFileText,
  IconMail,
  IconRefresh,
  IconHome,
} from '@tabler/icons-react';
import { publicApi, adminApi, setAccessToken, getAccessToken } from '@/utils/api';

type TabType = 'analytics' | 'crypto' | 'faqs' | 'roadmap' | 'homepage';

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [token, setToken] = useState<string | null>(null);

  // FAQ Form State
  const [faqId, setFaqId] = useState<string | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState('GENERAL');
  const [faqOrder, setFaqOrder] = useState(1);
  const [isFaqFormOpen, setIsFaqFormOpen] = useState(false);

  // Roadmap Form State
  const [roadmapId, setRoadmapId] = useState<string | null>(null);
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [roadmapDate, setRoadmapDate] = useState('');
  const [roadmapProgress, setRoadmapProgress] = useState(0);
  const [roadmapStatus, setRoadmapStatus] = useState('UPCOMING');
  const [roadmapOrder, setRoadmapOrder] = useState(1);
  const [roadmapMilestones, setRoadmapMilestones] = useState<string[]>([]);
  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [isRoadmapFormOpen, setIsRoadmapFormOpen] = useState(false);

  // Crypto Setting Form State
  const [contractAddress, setContractAddress] = useState('');
  const [cryptoSuccessMsg, setCryptoSuccessMsg] = useState<string | null>(null);
  const [cryptoErrorMsg, setCryptoErrorMsg] = useState<string | null>(null);

  // Homepage CMS Form State
  const [heroHeadline, setHeroHeadline] = useState('');
  const [heroSubtext, setHeroSubtext] = useState('');
  const [launchCountdown, setLaunchCountdown] = useState('');
  const [features, setFeatures] = useState<any[]>([]);
  const [homepageSuccessMsg, setHomepageSuccessMsg] = useState<string | null>(null);
  const [homepageErrorMsg, setHomepageErrorMsg] = useState<string | null>(null);

  // Check auth on mount
  useEffect(() => {
    const activeToken = getAccessToken();
    if (!activeToken) {
      router.push('/admin/login');
    } else {
      setToken(activeToken);
    }
  }, [router]);

  // Query: Analytics Report
  const { data: analytics, isLoading: isAnalyticsLoading, refetch: refetchAnalytics } = useQuery<any>({
    queryKey: ['analyticsReport'],
    queryFn: () => adminApi.getAnalyticsReport(),
    enabled: !!token && activeTab === 'analytics',
    retry: false,
    onError: () => {
      // Clear token and redirect if unauthorized
      setAccessToken(null);
      router.push('/admin/login');
    },
  } as any);

  // Query: FAQ List
  const { data: faqs, isLoading: isFaqsLoading } = useQuery<any>({
    queryKey: ['faqsList'],
    queryFn: () => publicApi.getFaq(),
    enabled: !!token,
  });

  // Query: Roadmap Phases
  const { data: roadmap, isLoading: isRoadmapLoading } = useQuery<any>({
    queryKey: ['roadmapList'],
    queryFn: () => publicApi.getRoadmap(),
    enabled: !!token,
  });

  // Query: Crypto Settings
  const { data: cryptoSettings } = useQuery<any>({
    queryKey: ['cryptoSettings'],
    queryFn: () => publicApi.getCryptoSettings(),
    enabled: !!token,
    onSuccess: (data: any) => {
      if (data?.contractAddress) {
        setContractAddress(data.contractAddress);
      }
    },
  } as any);

  useEffect(() => {
    const settings = cryptoSettings as any;
    if (settings?.contractAddress) {
      setContractAddress(settings.contractAddress);
    }
  }, [cryptoSettings]);

  // Mutation: Update Crypto Settings
  const cryptoMutation = useMutation({
    mutationFn: (newAddress: string) => adminApi.updateCryptoSettings({ contractAddress: newAddress }),
    onSuccess: () => {
      setCryptoSuccessMsg('Contract address updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['cryptoSettings'] });
      setTimeout(() => setCryptoSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setCryptoErrorMsg(err?.message || 'Failed to update address.');
      setTimeout(() => setCryptoErrorMsg(null), 3000);
    },
  });

  // Query: CMS Home page content
  const { data: cmsHome, isLoading: isCmsHomeLoading } = useQuery<any>({
    queryKey: ['cmsHome'],
    queryFn: () => publicApi.getPage('home'),
    enabled: !!token,
  });

  useEffect(() => {
    if (cmsHome?.content) {
      try {
        const parsed = JSON.parse(cmsHome.content);
        setHeroHeadline(parsed.heroHeadline || '');
        setHeroSubtext(parsed.heroSubtext || '');
        setLaunchCountdown(parsed.launchCountdown || '');
        setFeatures(parsed.features || []);
      } catch (e) {
        console.error('Failed to parse home page CMS content', e);
      }
    }
  }, [cmsHome]);

  // Mutation: Save Homepage settings
  const homepageMutation = useMutation({
    mutationFn: (updatedContent: any) =>
      adminApi.updatePage('home', {
        title: 'Home Page Content',
        content: JSON.stringify(updatedContent),
      }),
    onSuccess: () => {
      setHomepageSuccessMsg('Homepage CMS content updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['cmsHome'] });
      setTimeout(() => setHomepageSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setHomepageErrorMsg(err?.message || 'Failed to update homepage content.');
      setTimeout(() => setHomepageErrorMsg(null), 3000);
    },
  });

  const getLocalDatetimeString = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  const handleHomepageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    homepageMutation.mutate({
      heroHeadline,
      heroSubtext,
      launchCountdown,
      features,
    });
  };

  // Mutation: Manage FAQs (Create/Update/Delete)
  const saveFaqMutation = useMutation({
    mutationFn: (data: any) => {
      if (faqId) {
        return adminApi.updateFaqItem(faqId, data);
      }
      return adminApi.createFaqItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqsList'] });
      resetFaqForm();
    },
  });

  const deleteFaqMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteFaqItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqsList'] });
    },
  });

  // Mutation: Manage Roadmap (Create/Update/Delete)
  const saveRoadmapMutation = useMutation({
    mutationFn: (data: any) => {
      if (roadmapId) {
        return adminApi.updateRoadmapPhase(roadmapId, data);
      }
      return adminApi.createRoadmapPhase(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapList'] });
      resetRoadmapForm();
    },
  });

  const deleteRoadmapMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteRoadmapPhase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmapList'] });
    },
  });

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch (e) {}
    setAccessToken(null);
    router.push('/admin/login');
  };

  // Form Reset Helpers
  const resetFaqForm = () => {
    setFaqId(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('GENERAL');
    setFaqOrder(1);
    setIsFaqFormOpen(false);
  };

  const resetRoadmapForm = () => {
    setRoadmapId(null);
    setRoadmapTitle('');
    setRoadmapDate('');
    setRoadmapProgress(0);
    setRoadmapStatus('UPCOMING');
    setRoadmapOrder(1);
    setRoadmapMilestones([]);
    setNewMilestoneText('');
    setIsRoadmapFormOpen(false);
  };

  // FAQ Form Submit
  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveFaqMutation.mutate({
      question: faqQuestion,
      answer: faqAnswer,
      category: faqCategory,
      order: Number(faqOrder),
    });
  };

  const handleEditFaqClick = (faq: any) => {
    setFaqId(faq.id);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category);
    setFaqOrder(faq.order);
    setIsFaqFormOpen(true);
  };

  // Roadmap Form Submit
  const handleRoadmapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveRoadmapMutation.mutate({
      title: roadmapTitle,
      date: roadmapDate,
      progress: Number(roadmapProgress),
      status: roadmapStatus,
      milestones: JSON.stringify(roadmapMilestones),
      order: Number(roadmapOrder),
    });
  };

  const handleEditRoadmapClick = (phase: any) => {
    setRoadmapId(phase.id);
    setRoadmapTitle(phase.title);
    setRoadmapDate(phase.date);
    setRoadmapProgress(phase.progress);
    setRoadmapStatus(phase.status);
    setRoadmapOrder(phase.order || 1);
    try {
      setRoadmapMilestones(JSON.parse(phase.milestones));
    } catch (e) {
      setRoadmapMilestones([]);
    }
    setIsRoadmapFormOpen(true);
  };

  const addMilestone = () => {
    if (newMilestoneText.trim()) {
      setRoadmapMilestones([...roadmapMilestones, newMilestoneText.trim()]);
      setNewMilestoneText('');
    }
  };

  const removeMilestone = (index: number) => {
    setRoadmapMilestones(roadmapMilestones.filter((_, i) => i !== index));
  };

  if (!token) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-primary-bg">
        <IconLoader2 className="h-8 w-8 text-accent-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-primary-bg font-body">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-primary-bg border-b md:border-b-0 md:border-r border-accent-gold/15 p-6 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <IconBell className="h-6 w-6 text-accent-gold" />
            <span className="font-display text-lg font-bold tracking-wider text-text-primary">
              BELL PORTAL
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-accent-gold/15 text-accent-gold border-l-2 border-accent-gold'
                  : 'text-text-secondary hover:bg-surface-glass hover:text-text-primary'
              }`}
            >
              <IconChartBar className="h-5 w-5" />
              Overview & Stats
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'crypto'
                  ? 'bg-accent-gold/15 text-accent-gold border-l-2 border-accent-gold'
                  : 'text-text-secondary hover:bg-surface-glass hover:text-text-primary'
              }`}
            >
              <IconSettings className="h-5 w-5" />
              Crypto Settings
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-accent-gold/15 text-accent-gold border-l-2 border-accent-gold'
                  : 'text-text-secondary hover:bg-surface-glass hover:text-text-primary'
              }`}
            >
              <IconHelp className="h-5 w-5" />
              Manage FAQs
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'roadmap'
                  ? 'bg-accent-gold/15 text-accent-gold border-l-2 border-accent-gold'
                  : 'text-text-secondary hover:bg-surface-glass hover:text-text-primary'
              }`}
            >
              <IconMap className="h-5 w-5" />
              Manage Roadmap
            </button>
            <button
              onClick={() => setActiveTab('homepage')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === 'homepage'
                  ? 'bg-accent-gold/15 text-accent-gold border-l-2 border-accent-gold'
                  : 'text-text-secondary hover:bg-surface-glass hover:text-text-primary'
              }`}
            >
              <IconHome className="h-5 w-5" />
              Homepage CMS
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <button
          onClick={handleLogout}
          className="mt-8 flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-colors w-full cursor-pointer"
        >
          <IconLogout className="h-5 w-5" />
          Log Out
        </button>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                  Overview & Stats
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Site visitor statistics and action conversions report.
                </p>
              </div>
              <button
                onClick={() => refetchAnalytics()}
                className="rounded-lg bg-surface-glass p-2 border border-accent-gold/15 hover:border-accent-gold/40 hover:text-accent-gold transition-all cursor-pointer"
                title="Refresh Report"
              >
                <IconRefresh className="h-5 w-5" />
              </button>
            </div>

            {isAnalyticsLoading ? (
              <div className="flex h-64 items-center justify-center">
                <IconLoader2 className="h-8 w-8 text-accent-gold animate-spin" />
              </div>
            ) : (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass-panel p-6 border-accent-gold/10">
                    <span className="text-xs uppercase tracking-wider text-text-secondary">
                      Unique Visitors
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold font-display mt-2 text-accent-gold">
                      {analytics?.overview?.totalVisitors ?? 0}
                    </h3>
                    <span className="text-xs text-text-secondary/70 mt-1 block">
                      Total sessions recorded
                    </span>
                  </div>

                  <div className="glass-panel p-6 border-accent-gold/10">
                    <span className="text-xs uppercase tracking-wider text-text-secondary">
                      Total Page Views
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold font-display mt-2 text-accent-gold">
                      {analytics?.overview?.totalPageViews ?? 0}
                    </h3>
                    <span className="text-xs text-text-secondary/70 mt-1 block">
                      Total navigations tracked
                    </span>
                  </div>

                  <div className="glass-panel p-6 border-accent-gold/10">
                    <span className="text-xs uppercase tracking-wider text-text-secondary">
                      Session Bounce Rate
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold font-display mt-2 text-accent-gold">
                      {analytics?.overview?.bounceRate ?? 0}%
                    </h3>
                    <span className="text-xs text-text-secondary/70 mt-1 block">
                      Single-page visit metric
                    </span>
                  </div>

                  <div className="glass-panel p-6 border-accent-gold/10">
                    <span className="text-xs uppercase tracking-wider text-text-secondary">
                      Avg Session Duration
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold font-display mt-2 text-accent-gold">
                      {analytics?.overview?.avgDuration ?? '0s'}
                    </h3>
                    <span className="text-xs text-text-secondary/70 mt-1 block">
                      Time spent on platform
                    </span>
                  </div>
                </div>

                {/* Conversion Splits & Traffic Sources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Goal Conversions */}
                  <div className="glass-panel p-6 border-accent-gold/10 flex flex-col gap-4">
                    <h4 className="font-display text-sm font-bold text-text-primary tracking-wider border-b border-accent-gold/10 pb-3">
                      Conversion Goal Metrics
                    </h4>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between border-b border-accent-gold/5 pb-2 text-sm">
                        <span className="flex items-center gap-2 text-text-secondary">
                          <IconTrendingUp className="h-4 w-4 text-accent-gold" />
                          Buy Now / Raydium Clicks
                        </span>
                        <span className="font-mono font-bold text-text-primary">
                          {analytics?.conversions?.buy_now_clicks ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-accent-gold/5 pb-2 text-sm">
                        <span className="flex items-center gap-2 text-text-secondary">
                          <IconMail className="h-4 w-4 text-accent-gold" />
                          Newsletter Signups
                        </span>
                        <span className="font-mono font-bold text-text-primary">
                          {analytics?.conversions?.newsletter_signups ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-accent-gold/5 pb-2 text-sm">
                        <span className="flex items-center gap-2 text-text-secondary">
                          <IconFileText className="h-4 w-4 text-accent-gold" />
                          Whitepaper Downloads
                        </span>
                        <span className="font-mono font-bold text-text-primary">
                          {analytics?.conversions?.whitepaper_downloads ?? 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-text-secondary">
                          <IconHelp className="h-4 w-4 text-accent-gold" />
                          Contact Submissions
                        </span>
                        <span className="font-mono font-bold text-text-primary">
                          {analytics?.conversions?.contact_submissions ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Traffic Sources */}
                  <div className="glass-panel p-6 border-accent-gold/10 flex flex-col gap-4">
                    <h4 className="font-display text-sm font-bold text-text-primary tracking-wider border-b border-accent-gold/10 pb-3">
                      Traffic Source Splits
                    </h4>
                    <div className="flex flex-col gap-3">
                      {Object.entries(analytics?.trafficSources ?? {}).map(([source, count]: any) => (
                        <div key={source} className="flex items-center justify-between border-b border-accent-gold/5 pb-2 text-sm capitalize">
                          <span className="text-text-secondary">{source}</span>
                          <span className="font-mono font-bold text-text-primary">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Visited Pages */}
                <div className="glass-panel p-6 border-accent-gold/10 flex flex-col gap-4">
                  <h4 className="font-display text-sm font-bold text-text-primary tracking-wider border-b border-accent-gold/10 pb-3">
                    Top Visited Pages
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-text-secondary border-b border-accent-gold/10">
                          <th className="py-2.5 font-semibold">Page URL Path</th>
                          <th className="py-2.5 font-semibold text-right">Pageviews</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics?.topPages?.map((p: any, idx: number) => (
                          <tr key={idx} className="border-b border-accent-gold/5 text-xs">
                            <td className="py-3 font-mono text-text-primary">{p.page}</td>
                            <td className="py-3 text-right font-mono font-bold text-accent-gold">
                              {p.views}
                            </td>
                          </tr>
                        ))}
                        {(!analytics?.topPages || analytics?.topPages.length === 0) && (
                          <tr>
                            <td colSpan={2} className="py-8 text-center text-text-secondary/50">
                              No pageview events tracked yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Crypto Settings Tab */}
        {activeTab === 'crypto' && (
          <div className="flex flex-col gap-6 max-w-2xl">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                Crypto Settings
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Configure the dynamic Solana (SPL) contract address displayed across the platform.
              </p>
            </div>

            <div className="glass-panel p-6 border-accent-gold/15 gold-glow flex flex-col gap-6 mt-4">
              {cryptoSuccessMsg && (
                <div className="rounded-lg bg-green-950/45 border border-green-500/25 p-3 flex items-center gap-2.5 text-xs text-green-200">
                  <IconCheck className="h-5 w-5 shrink-0" />
                  <span>{cryptoSuccessMsg}</span>
                </div>
              )}
              {cryptoErrorMsg && (
                <div className="rounded-lg bg-red-950/45 border border-red-500/25 p-3 flex items-center gap-2.5 text-xs text-red-200">
                  <IconAlertCircle className="h-5 w-5 shrink-0" />
                  <span>{cryptoErrorMsg}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  cryptoMutation.mutate(contractAddress);
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    Official Solana (SPL) Token Contract Address
                  </label>
                  <input
                    type="text"
                    required
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="Enter Solana Address (e.g. 7xKX...)"
                    className="w-full rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-3 px-4 text-sm text-text-primary font-mono focus:border-accent-gold/50 focus:outline-none transition-colors"
                  />
                  <span className="text-xs text-text-secondary/70">
                    Modifying this value will instantly update the official address displayed on the &ldquo;How to Buy&rdquo; guide and the site Footer without rebuilding the frontend code.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={cryptoMutation.isPending}
                  className="w-full md:w-auto self-start mt-2 px-6 py-3 rounded-lg bg-accent-gold text-primary-bg font-bold text-sm hover:bg-accent-champagne hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cryptoMutation.isPending ? (
                    <IconLoader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    'Save Contract Address'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                  Manage FAQs
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Add, update, or remove question and answer cards displayed on the FAQ page.
                </p>
              </div>
              <button
                onClick={() => {
                  resetFaqForm();
                  setIsFaqFormOpen(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-bold text-primary-bg hover:bg-accent-champagne transition-all cursor-pointer shadow-md"
              >
                <IconPlus className="h-4.5 w-4.5" />
                Add FAQ Item
              </button>
            </div>

            {/* FAQ Entry Modal / Form */}
            {isFaqFormOpen && (
              <div className="glass-panel p-6 border-accent-gold/25 max-w-2xl relative gold-glow">
                <h3 className="font-display text-sm font-bold text-accent-gold uppercase tracking-wider mb-4">
                  {faqId ? 'Edit FAQ Item' : 'New FAQ Item'}
                </h3>
                <form onSubmit={handleFaqSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Category Slug
                      </label>
                      <input
                        type="text"
                        required
                        value={faqCategory}
                        onChange={(e) => setFaqCategory(e.target.value.toUpperCase())}
                        placeholder="GENERAL"
                        className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Display Order
                      </label>
                      <input
                        type="number"
                        required
                        value={faqOrder}
                        onChange={(e) => setFaqOrder(Number(e.target.value))}
                        placeholder="1"
                        min={1}
                        className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase">
                      Question Text
                    </label>
                    <input
                      type="text"
                      required
                      value={faqQuestion}
                      onChange={(e) => setFaqQuestion(e.target.value)}
                      placeholder="e.g. What is the slippage tolerance?"
                      className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-secondary uppercase">
                      Answer Text (Details)
                    </label>
                    <textarea
                      required
                      value={faqAnswer}
                      onChange={(e) => setFaqAnswer(e.target.value)}
                      placeholder="Provide a detailed markdown or text explanation..."
                      rows={4}
                      className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40 resize-y"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={resetFaqForm}
                      className="px-4 py-2.5 rounded-lg border border-accent-gold/15 text-text-secondary hover:text-text-primary hover:bg-surface-glass text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveFaqMutation.isPending}
                      className="px-4 py-2.5 rounded-lg bg-accent-gold text-primary-bg text-xs font-bold hover:bg-accent-champagne transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {saveFaqMutation.isPending ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Save FAQ Item'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List */}
            {isFaqsLoading ? (
              <div className="flex h-32 items-center justify-center">
                <IconLoader2 className="h-8 w-8 text-accent-gold animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {faqs?.map((faq: any) => (
                  <div
                    key={faq.id}
                    className="glass-panel p-6 border-accent-gold/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-accent-gold/25 transition-colors"
                  >
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-accent-gold/10 text-accent-gold uppercase">
                          {faq.category}
                        </span>
                        <span className="text-[10px] font-mono text-text-secondary/70">
                          Order: {faq.order}
                        </span>
                      </div>
                      <h4 className="font-semibold text-text-primary text-sm">{faq.question}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditFaqClick(faq)}
                        className="rounded-lg p-2 bg-surface-glass border border-accent-gold/10 text-text-secondary hover:text-accent-gold hover:border-accent-gold/30 transition-all cursor-pointer"
                        title="Edit FAQ"
                      >
                        <IconEdit className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this FAQ item?')) {
                            deleteFaqMutation.mutate(faq.id);
                          }
                        }}
                        className="rounded-lg p-2 bg-surface-glass border border-red-500/10 text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                        title="Delete FAQ"
                      >
                        <IconTrash className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {(!faqs || faqs.length === 0) && (
                  <div className="text-center py-12 text-text-secondary/50">
                    No FAQ items registered.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Roadmap Tab */}
        {activeTab === 'roadmap' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                  Manage Roadmap
                </h1>
                <p className="text-sm text-text-secondary mt-1">
                  Configure the project timeline phases, progress bars, and accomplishments milestones.
                </p>
              </div>
              <button
                onClick={() => {
                  resetRoadmapForm();
                  setIsRoadmapFormOpen(true);
                }}
                className="flex items-center gap-2 rounded-lg bg-accent-gold px-4 py-2.5 text-sm font-bold text-primary-bg hover:bg-accent-champagne transition-all cursor-pointer shadow-md"
              >
                <IconPlus className="h-4.5 w-4.5" />
                Add Phase
              </button>
            </div>

            {/* Roadmap Phase Form */}
            {isRoadmapFormOpen && (
              <div className="glass-panel p-6 border-accent-gold/25 max-w-2xl relative gold-glow">
                <h3 className="font-display text-sm font-bold text-accent-gold uppercase tracking-wider mb-4">
                  {roadmapId ? 'Edit Roadmap Phase' : 'New Roadmap Phase'}
                </h3>
                <form onSubmit={handleRoadmapSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Phase Title
                      </label>
                      <input
                        type="text"
                        required
                        value={roadmapTitle}
                        onChange={(e) => setRoadmapTitle(e.target.value)}
                        placeholder="Phase 1: Foundation"
                        className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Target Date/Quarter
                      </label>
                      <input
                        type="text"
                        required
                        value={roadmapDate}
                        onChange={(e) => setRoadmapDate(e.target.value)}
                        placeholder="Q1 2026"
                        className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Progress %
                      </label>
                      <input
                        type="number"
                        required
                        value={roadmapProgress}
                        onChange={(e) => setRoadmapProgress(Number(e.target.value))}
                        min={0}
                        max={100}
                        className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Status Code
                      </label>
                      <select
                        value={roadmapStatus}
                        onChange={(e) => setRoadmapStatus(e.target.value)}
                        className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40"
                      >
                        <option value="UPCOMING">Upcoming</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-secondary uppercase">
                        Display Order
                      </label>
                      <input
                        type="number"
                        required
                        value={roadmapOrder}
                        onChange={(e) => setRoadmapOrder(Number(e.target.value))}
                        min={1}
                        className="rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2.5 px-3 text-sm focus:outline-none focus:border-accent-gold/40 font-mono"
                      />
                    </div>
                  </div>

                  {/* Milestones Manager */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-text-secondary uppercase">
                      Milestones Checklist
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMilestoneText}
                        onChange={(e) => setNewMilestoneText(e.target.value)}
                        placeholder="Add a milestone achievement..."
                        className="flex-1 rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-2 px-3 text-sm focus:outline-none focus:border-accent-gold/40"
                      />
                      <button
                        type="button"
                        onClick={addMilestone}
                        className="px-4 py-2 rounded-lg bg-accent-gold text-primary-bg text-xs font-bold hover:bg-accent-champagne cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <ul className="flex flex-col gap-1.5 mt-2">
                      {roadmapMilestones.map((m, idx) => (
                        <li key={idx} className="flex items-center justify-between bg-primary-bg/30 px-3 py-2 rounded border border-accent-gold/10 text-xs text-text-secondary">
                          <span>{m}</span>
                          <button
                            type="button"
                            onClick={() => removeMilestone(idx)}
                            className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={resetRoadmapForm}
                      className="px-4 py-2.5 rounded-lg border border-accent-gold/15 text-text-secondary hover:text-text-primary hover:bg-surface-glass text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saveRoadmapMutation.isPending}
                      className="px-4 py-2.5 rounded-lg bg-accent-gold text-primary-bg text-xs font-bold hover:bg-accent-champagne transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {saveRoadmapMutation.isPending ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Save Phase'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List */}
            {isRoadmapLoading ? (
              <div className="flex h-32 items-center justify-center">
                <IconLoader2 className="h-8 w-8 text-accent-gold animate-spin" />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {roadmap?.map((phase: any) => {
                  let milestonesArray: string[] = [];
                  try {
                    milestonesArray = JSON.parse(phase.milestones);
                  } catch (e) {}

                  return (
                    <div
                      key={phase.id}
                      className="glass-panel p-6 border-accent-gold/10 flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-accent-gold/25 transition-colors"
                    >
                      <div className="flex-1 flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                            phase.status === 'COMPLETED'
                              ? 'bg-green-950/20 text-green-400'
                              : phase.status === 'IN_PROGRESS'
                              ? 'bg-blue-950/20 text-blue-400'
                              : 'bg-accent-gold/10 text-accent-gold'
                          }`}>
                            {phase.status}
                          </span>
                          <span className="text-[10px] font-mono text-text-secondary/70">
                            Order: {phase.order} • {phase.date} • {phase.progress}% Progress
                          </span>
                        </div>
                        <h4 className="font-semibold text-text-primary text-sm">{phase.title}</h4>
                        {milestonesArray.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-wider text-text-secondary/60">Milestones:</span>
                            <ul className="list-disc list-inside text-xs text-text-secondary">
                              {milestonesArray.map((m, idx) => (
                                <li key={idx}>{m}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditRoadmapClick(phase)}
                          className="rounded-lg p-2 bg-surface-glass border border-accent-gold/10 text-text-secondary hover:text-accent-gold hover:border-accent-gold/30 transition-all cursor-pointer"
                          title="Edit Phase"
                        >
                          <IconEdit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this phase?')) {
                              deleteRoadmapMutation.mutate(phase.id);
                            }
                          }}
                          className="rounded-lg p-2 bg-surface-glass border border-red-500/10 text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer"
                          title="Delete Phase"
                        >
                          <IconTrash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!roadmap || roadmap.length === 0) && (
                  <div className="text-center py-12 text-text-secondary/50">
                    No roadmap phases registered.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Homepage Tab */}
        {activeTab === 'homepage' && (
          <div className="flex flex-col gap-6 max-w-2xl">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                Homepage CMS
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                Configure the launch countdown, main headline, and subtext displayed on the website homepage.
              </p>
            </div>

            <div className="glass-panel p-6 border-accent-gold/15 gold-glow flex flex-col gap-6 mt-4">
              {homepageSuccessMsg && (
                <div className="rounded-lg bg-green-950/45 border border-green-500/25 p-3 flex items-center gap-2.5 text-xs text-green-200">
                  <IconCheck className="h-5 w-5 shrink-0" />
                  <span>{homepageSuccessMsg}</span>
                </div>
              )}
              {homepageErrorMsg && (
                <div className="rounded-lg bg-red-950/45 border border-red-500/25 p-3 flex items-center gap-2.5 text-xs text-red-200">
                  <IconAlertCircle className="h-5 w-5 shrink-0" />
                  <span>{homepageErrorMsg}</span>
                </div>
              )}

              {isCmsHomeLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <IconLoader2 className="h-8 w-8 text-accent-gold animate-spin" />
                </div>
              ) : (
                <form onSubmit={handleHomepageSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Hero Headline
                    </label>
                    <input
                      type="text"
                      required
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      placeholder="e.g. Building Financial Freedom for Generations"
                      className="w-full rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-3 px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Hero Subtext
                    </label>
                    <textarea
                      required
                      value={heroSubtext}
                      onChange={(e) => setHeroSubtext(e.target.value)}
                      placeholder="e.g. The enterprise-grade Web3 asset built to secure..."
                      rows={3}
                      className="w-full rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-3 px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-none transition-colors resize-y"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                      Launch Countdown Timestamp (UTC ISO Date)
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={getLocalDatetimeString(launchCountdown)}
                      onChange={(e) => {
                        if (!e.target.value) {
                          setLaunchCountdown('');
                          return;
                        }
                        try {
                          const iso = new Date(e.target.value).toISOString();
                          setLaunchCountdown(iso);
                        } catch (e) {
                          // Ignore invalid dates
                        }
                      }}
                      className="w-full rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-3 px-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-none transition-colors"
                    />
                    <span className="text-xs text-text-secondary/70 mt-1">
                      Choose the target end date and time for the token launch countdown counter on the home page.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={homepageMutation.isPending}
                    className="w-full md:w-auto self-start mt-2 px-6 py-3 rounded-lg bg-accent-gold text-primary-bg font-bold text-sm hover:bg-accent-champagne hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {homepageMutation.isPending ? (
                      <IconLoader2 className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      'Save Homepage CMS'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
