'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  IconCopy,
  IconCheck,
  IconExternalLink,
  IconChartCandle,
  IconLoader2,
  IconInfoCircle,
} from '@tabler/icons-react';
import { publicApi } from '@/utils/api';

export default function ChartPage() {
  const [copied, setCopied] = useState(false);

  // Fetch settings for contract address
  const { data: crypto, isLoading } = useQuery({
    queryKey: ['cryptoSettings'],
    queryFn: () => publicApi.getCryptoSettings(),
  });

  const contractAddress = crypto?.contractAddress || '7xKX1v2B8kFqE2pAd8Ad1T2P6Sj4b3g9B1N8xQ2yZ1r9';

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Embed URL for DexScreener Solana chart
  const dexscreenerEmbedUrl = `https://dexscreener.com/solana/${contractAddress}?embed=1&theme=dark`;
  const dexscreenerFullUrl = `https://dexscreener.com/solana/${contractAddress}`;

  return (
    <div className="py-16 px-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl -z-10" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold flex items-center justify-center gap-1.5">
            <IconChartCandle className="h-4 w-4" />
            Live Market Feed
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            BELL/SOL Ecosystem Chart
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Monitor real-time price trends, trading volume, and liquidity pools on DexScreener.
          </p>
          <div className="mx-auto h-[1px] w-24 bg-accent-gold/40 mt-2" />
        </div>

        {/* Live Chart Container */}
        <div className="glass-panel border-accent-gold/15 p-1 mb-10 gold-glow rounded-2xl overflow-hidden bg-surface-glass/40">
          <div className="relative w-full h-[650px] rounded-xl overflow-hidden bg-primary-bg/85 flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <IconLoader2 className="h-8 w-8 text-accent-gold animate-spin" />
                <span className="text-xs text-text-secondary">Loading market chart...</span>
              </div>
            ) : (
              <iframe
                src={dexscreenerEmbedUrl}
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

        {/* Quick Tools & Info Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left panel: contract details */}
          <div className="glass-panel border-accent-gold/10 p-6 flex flex-col gap-4 bg-surface-glass/20">
            <div className="flex items-center gap-2 border-b border-accent-gold/10 pb-3">
              <IconInfoCircle className="h-5 w-5 text-accent-gold" />
              <h3 className="font-display text-sm font-bold text-text-primary uppercase tracking-wider">
                Token Details
              </h3>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-text-secondary uppercase">
                  BELL Token Address (Solana)
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 font-mono text-xs text-text-primary bg-primary-bg/75 px-4 py-3 rounded-lg border border-accent-gold/10 truncate">
                    {contractAddress}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="rounded-lg bg-accent-gold/10 border border-accent-gold/30 p-3 text-accent-gold hover:bg-accent-gold hover:text-primary-bg transition-all"
                    title="Copy Contract Address"
                  >
                    {copied ? <IconCheck className="h-4.5 w-4.5" /> : <IconCopy className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="bg-primary-bg/30 p-3 rounded-lg border border-accent-gold/5 text-center">
                  <span className="text-[10px] text-text-secondary uppercase block">Token Symbol</span>
                  <span className="font-bold text-sm text-accent-gold mt-0.5 block">BELL</span>
                </div>
                <div className="bg-primary-bg/30 p-3 rounded-lg border border-accent-gold/5 text-center">
                  <span className="text-[10px] text-text-secondary uppercase block">Network</span>
                  <span className="font-bold text-sm text-text-primary mt-0.5 block">Solana SPL</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: External access links */}
          <div className="glass-panel border-accent-gold/10 p-6 flex flex-col justify-between gap-6 bg-surface-glass/20 h-full min-h-[196px]">
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-sm font-bold text-text-primary uppercase tracking-wider border-b border-accent-gold/10 pb-3">
                Trading Terminals
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mt-2">
                Want to trade directly or look up transactions histories? Open the BELL token dashboard on full external analytics portals.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href={dexscreenerFullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-accent-gold px-5 py-3 text-xs font-bold text-primary-bg hover:bg-accent-champagne hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md shadow-accent-gold/10 min-w-[200px]"
              >
                Open on DexScreener
                <IconExternalLink className="h-4 w-4" />
              </a>
              <a
                href={crypto?.buyNowUrl || 'https://jup.ag'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-5 py-3 text-xs font-bold text-accent-gold hover:bg-accent-gold/10 transition-all min-w-[200px]"
              >
                Trade on Jupiter / Raydium
                <IconExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
