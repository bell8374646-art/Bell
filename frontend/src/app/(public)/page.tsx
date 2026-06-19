// page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  IconArrowRight,
  IconTrendingUp,
  IconUsers,
  IconCoin,
  IconDeviceAnalytics,
  IconShield,
  IconCircleCheck,
  IconBrandTelegram,
  IconBrandTwitter,
  IconBrandDiscord,
  IconExternalLink,
} from '@tabler/icons-react';

import CoinCanvas from '@/components/CoinCanvas';
import { publicApi } from '@/utils/api';
import { useAnalytics } from '@/hooks/useAnalytics';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function HomePage() {
  const { logAction } = useAnalytics();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterName, setNewsletterName] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');

  // 1. Fetch live coin settings & stats
  const { data: crypto, isLoading: isCryptoLoading } = useQuery({
    queryKey: ['cryptoSettings'],
    queryFn: () => publicApi.getCryptoSettings(),
    refetchInterval: 60000, // refresh every minute
  });

  // 2. Fetch CMS home content
  const { data: cmsHome } = useQuery({
    queryKey: ['cmsHome'],
    queryFn: () => publicApi.getPage('home'),
  });

  const homeData = cmsHome ? JSON.parse(cmsHome.content) : {
    heroHeadline: 'Building Financial Freedom for Generations',
    heroSubtext: 'The enterprise-grade Web3 asset built to secure, grow, and pass down family wealth with confidence.',
    launchCountdown: '2026-12-31T23:59:59.000Z',
    features: [
      { icon: 'shield', title: 'Institutional Trust', desc: 'Fully audited contract structure with locked liquidity and multi-signature operations.' },
      { icon: 'chart', title: 'Deflationary Growth', desc: 'Built-in transaction burn mechanism and automated staking rewards for holders.' },
      { icon: 'users', title: 'Family-First Focus', desc: 'Tools designed to co-manage family assets, inheritance transfers, and junior wallets.' }
    ]
  };

  // 3. Countdown timer logic
  useEffect(() => {
    const targetDate = new Date(homeData.launchCountdown || '2026-12-31T23:59:59.000Z').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [homeData.launchCountdown]);

  // 4. Newsletter submission
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSuccess(null);
    setNewsletterError(null);

    if (!newsletterEmail) return;

    try {
      logAction('newsletter_subscribe_attempt', { email: newsletterEmail });
      const response = await publicApi.subscribeNewsletter({
        email: newsletterEmail,
        firstName: newsletterName,
        source: 'homepage_hero',
      });
      setNewsletterSuccess(response);
      setNewsletterEmail('');
      setNewsletterName('');
      logAction('newsletter_subscribe_success');
    } catch (err: any) {
      setNewsletterError(err.message || 'Subscription failed');
    }
  };

  // 5. Chart JS configuration
  const chartData = {
    labels: ['Presale', 'Liquidity Pool', 'Staking & Reserve', 'Marketing', 'Core Team'],
    datasets: [
      {
        data: [40, 30, 15, 10, 5],
        backgroundColor: [
          '#D4AF37', // metallic gold
          '#F5E6A3', // champagne gold
          '#B0B3B8', // silver
          '#1A1A2E', // dark surface
          '#0A0A0B', // deep black
        ],
        borderColor: 'rgba(212, 175, 55, 0.2)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#F8F9FA',
          font: { family: 'Inter', size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <div className="relative min-h-screen">
      {/* 3D Hero Section */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden border-b border-accent-gold/15 py-12 px-6">
        <div className="canvas-container">
          <CoinCanvas />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl text-center flex flex-col items-center gap-6 mt-10">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold border border-accent-gold/30 px-3 py-1 rounded-full bg-accent-gold/5">
            Bell Coin Token Sale
          </span>

          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-text-primary leading-tight max-w-4xl">
            {homeData.heroHeadline}
          </h1>

          <p className="max-w-2xl text-base md:text-lg text-text-secondary leading-relaxed">
            {homeData.heroSubtext}
          </p>

          {/* Countdown Timer */}
          <div className="flex gap-4 items-center my-6">
            {[
              { val: timeLeft.days, unit: 'Days' },
              { val: timeLeft.hours, unit: 'Hours' },
              { val: timeLeft.minutes, unit: 'Min' },
              { val: timeLeft.seconds, unit: 'Sec' },
            ].map((box, i) => (
              <div key={i} className="glass-panel w-20 h-20 md:w-24 md:h-24 flex flex-col justify-center items-center shadow-lg border border-accent-gold/20">
                <span className="font-display text-xl md:text-3xl font-extrabold text-accent-gold tracking-tight">{String(box.val).padStart(2, '0')}</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wider text-text-secondary mt-1">{box.unit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
            <Link
              href="/how-to-buy"
              onClick={() => logAction('click_buy_now')}
              className="w-full sm:w-auto rounded-full bg-accent-gold px-8 py-3.5 text-sm font-bold text-primary-bg hover:bg-accent-champagne hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-accent-gold/25"
            >
              Buy Bell Coin
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="w-full sm:w-auto rounded-full border border-text-secondary/30 bg-surface-glass px-8 py-3.5 text-sm font-semibold text-text-primary hover:border-accent-gold transition-all duration-300 flex items-center justify-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="relative z-10 -mt-10 mx-auto max-w-6xl px-6">
        <div className="glass-panel p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center border-accent-gold/30 gold-glow">
          {[
            { label: 'BELL Price', val: isCryptoLoading ? '...' : `$${crypto?.livePrice || '0.0125'}`, icon: IconCoin },
            { label: 'Market Cap', val: isCryptoLoading ? '...' : `$${(crypto?.marketCap || 12500000).toLocaleString()}`, icon: IconTrendingUp },
            { label: 'Active Holders', val: isCryptoLoading ? '...' : `${(crypto?.manualHolders || 1540).toLocaleString()} +`, icon: IconUsers },
            { label: '24h Vol (Raydium)', val: isCryptoLoading ? '...' : `$${(crypto?.manualVolume || 384200).toLocaleString()}`, icon: IconDeviceAnalytics },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-xs uppercase tracking-wider text-text-secondary mt-1">{stat.label}</span>
              <span className="font-display text-lg md:text-xl font-bold text-text-primary">{stat.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Why Bell Coin Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Platform Benefits
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight">
            Why Invest in Bell Coin?
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Designed for stability, community expansion, and transparent governance to serve multi-generational growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {homeData.features.map((feature: any, i: number) => (
            <div key={i} className="glass-panel glass-panel-hover p-8 flex flex-col gap-4 relative overflow-hidden group">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                {feature.icon === 'shield' && <IconShield className="h-6 w-6" />}
                {feature.icon === 'chart' && <IconTrendingUp className="h-6 w-6" />}
                {feature.icon === 'users' && <IconUsers className="h-6 w-6" />}
              </div>
              <h3 className="font-display text-lg font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Live Trading Chart Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-accent-gold/15">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Real-Time Market
          </span>
          <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight">
            Live Trading Chart
          </h2>
          <p className="text-text-secondary leading-relaxed">
            Monitor real-time price action, trades, and liquidity depth for BELL directly on our official platform.
          </p>
        </div>

        <div className="glass-panel border-accent-gold/20 p-1.5 gold-glow rounded-2xl overflow-hidden bg-surface-glass/40">
          <div className="relative w-full h-[550px] rounded-xl overflow-hidden bg-primary-bg/85">
            {isCryptoLoading ? (
              <div className="flex h-full w-full items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-gold" />
              </div>
            ) : (
              <iframe
                src={`https://dexscreener.com/solana/${crypto?.contractAddress || '7xKX1v2B8kFqE2pAd8Ad1T2P6Sj4b3g9B1N8xQ2yZ1r9'}?embed=1&theme=dark`}
                title="DexScreener Live Chart"
                width="100%"
                height="100%"
                className="border-0 w-full h-full"
                allow="clipboard-write"
                allowFullScreen
              />
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <a
            href={`https://dexscreener.com/solana/${crypto?.contractAddress || '7xKX1v2B8kFqE2pAd8Ad1T2P6Sj4b3g9B1N8xQ2yZ1r9'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-accent-gold/15 border border-accent-gold/30 px-6 py-2.5 text-xs font-bold text-accent-gold hover:bg-accent-gold hover:text-primary-bg transition-all"
          >
            Open on DexScreener
            <IconExternalLink className="h-4.5 w-4.5" />
          </a>
        </div>
      </section>

      {/* Tokenomics Preview */}
      <section className="py-20 bg-primary-bg/50 border-t border-b border-accent-gold/15 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
              Supply Model
            </span>
            <h2 className="font-display text-2xl md:text-4xl font-bold tracking-tight">
              Deflationary & Audited Token Allocation
            </h2>
            <p className="text-text-secondary leading-relaxed">
              We hold transparency as our highest brand pillar. Total supply is capped at 21,000,000 BELL. 100% of team tokens are vested linearly over 36 months, and our burn mechanism removes 0.5% of transaction volume permanently.
            </p>
            <div className="flex flex-col gap-3">
              {['40% Presale allocations for community', '30% Liquidity pool locked for 3 years', '0.5% automated burn on transfers'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-text-primary font-medium">
                  <IconCircleCheck className="h-5 w-5 text-accent-gold" />
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/tokenomics"
              className="mt-4 font-display text-sm font-semibold text-accent-gold hover:text-accent-champagne flex items-center gap-2 group w-fit"
            >
              Explore Tokenomics details
              <IconArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="glass-panel p-8 min-h-[350px] relative flex justify-center items-center">
            <div className="w-full h-[300px]">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </section>

      {/* Partners Logos Strip */}
      <section className="py-16 px-6 text-center">
        <span className="text-xs uppercase tracking-widest text-text-secondary/60 block mb-8">
          SUPPORTED WALLETS & EXCHANGES
        </span>
        <div className="mx-auto max-w-5xl flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40">
          {['Phantom', 'Solflare', 'Raydium', 'CoinGecko', 'CoinMarketCap'].map((partner, i) => (
            <span key={i} className="font-display text-lg md:text-xl font-extrabold tracking-wider text-text-primary">
              {partner.toUpperCase()}
            </span>
          ))}
        </div>
      </section>

      {/* Community Banner */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="glass-panel border-accent-gold/25 p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row justify-between items-center gap-8 gold-glow">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-accent-gold/5 blur-3xl -z-10" />
          <div className="flex flex-col gap-4 text-center lg:text-left max-w-xl">
            <h3 className="font-display text-xl md:text-3xl font-bold tracking-tight">
              Join the Bell Coin Family
            </h3>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed">
              Connect with thousands of family-wealth investors in our communities. Access early updates, launch news, and weekly token distribution calendars.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://t.me/bellcoin0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-accent-gold/40 bg-surface-glass px-6 py-3 text-sm font-semibold text-text-primary hover:border-accent-gold transition-all duration-300"
            >
              <IconBrandTelegram className="h-5 w-5 text-accent-gold" />
              Telegram Channel
            </a>
            <a
              href="https://x.com/BellCoin0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-accent-gold/40 bg-surface-glass px-6 py-3 text-sm font-semibold text-text-primary hover:border-accent-gold transition-all duration-300"
            >
              <IconBrandTwitter className="h-5 w-5 text-accent-gold" />
              Twitter / X
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Form */}
      <section className="py-20 bg-surface-glass/40 border-t border-accent-gold/15 px-6">
        <div className="max-w-md mx-auto text-center flex flex-col gap-6">
          <h3 className="font-display text-xl md:text-2xl font-bold">
            Subscribe for Launch Alerts
          </h3>
          <p className="text-sm text-text-secondary">
            Get notified of token listings, reward staking releases, and official whitepaper update chapters.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              name="bot-trap"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
            />
            <input
              type="text"
              placeholder="First Name (Optional)"
              value={newsletterName}
              onChange={(e) => setNewsletterName(e.target.value)}
              className="w-full rounded-full border border-accent-gold/15 bg-primary-bg px-5 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent-gold outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full rounded-full border border-accent-gold/15 bg-primary-bg px-5 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent-gold outline-none transition-colors"
              required
            />
            <button
              type="submit"
              className="w-full rounded-full bg-accent-gold px-6 py-3 text-sm font-bold text-primary-bg hover:bg-accent-champagne hover:scale-[1.01] transition-all"
            >
              Subscribe Now
            </button>
          </form>

          {newsletterSuccess && (
            <p className="text-xs text-green-400 font-semibold border border-green-500/20 bg-green-500/5 py-2 px-3 rounded-lg">
              {newsletterSuccess}
            </p>
          )}

          {newsletterError && (
            <p className="text-xs text-red-400 font-semibold border border-red-500/20 bg-red-500/5 py-2 px-3 rounded-lg">
              {newsletterError}
            </p>
          )}

          <span className="text-[10px] text-text-secondary/50 leading-relaxed block">
            Double opt-in required. You can unsubscribe at any time. We never sell or share your data.
          </span>
        </div>
      </section>
    </div>
  );
}
