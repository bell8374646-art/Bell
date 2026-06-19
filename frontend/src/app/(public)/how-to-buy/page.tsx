// page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  IconCopy,
  IconCheck,
  IconWallet,
  IconArrowRightCircle,
  IconShield,
  IconSettings,
  IconExternalLink,
} from '@tabler/icons-react';
import { publicApi } from '@/utils/api';

export default function HowToBuyPage() {
  const [copied, setCopied] = useState(false);
  // Fetch settings for dynamic buy URLs
  const { data: crypto } = useQuery({
    queryKey: ['cryptoSettings'],
    queryFn: () => publicApi.getCryptoSettings(),
  });

  const contractAddress = crypto?.contractAddress || '7xKX1v2B8kFqE2pAd8Ad1T2P6Sj4b3g9B1N8xQ2yZ1r9';

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: '01',
      title: 'Create a Web3 Wallet',
      desc: 'Download Phantom or Solflare from official app stores. Secure your wallet by keeping your seed phrase private and offline.',
      icon: IconWallet,
    },
    {
      num: '02',
      title: 'Acquire Solana (SOL)',
      desc: 'Purchase SOL directly inside your wallet, or transfer it from a centralized exchange (like Coinbase or Binance) to your wallet address.',
      icon: IconShield,
    },
    {
      num: '03',
      title: 'Connect to Jupiter / Raydium DEX',
      desc: 'Navigate to Raydium or Jupiter, tap Connect Wallet, and approve connection. Ensure your network is set to Solana Mainnet.',
      icon: IconArrowRightCircle,
    },
    {
      num: '04',
      title: 'Paste Contract & Swap',
      desc: 'Copy the BELL contract address below and paste it in the swap select token field. Set slippage to 0.5% - 1% and click Swap!',
      icon: IconSettings,
    },
  ];

  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Quick Start Guide
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            How to Buy Bell Coin
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Follow this simple guide to acquire BELL tokens safely and start building your family staking vaults.
          </p>
          <div className="mx-auto h-[1px] w-24 bg-accent-gold/40 mt-2" />
        </div>

        {/* Contract Address Panel */}
        <div className="glass-panel border-accent-gold/30 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-16 gold-glow">
          <div className="flex flex-col gap-2">
            <span className="font-display text-xs font-bold text-accent-gold uppercase tracking-wider">
              Official Token Contract
            </span>
            <span className="text-sm text-text-secondary">
              Copy this address to search and swap on Raydium or Jupiter safely.
            </span>
          </div>
          <div className="flex w-full md:w-auto items-center gap-3">
            <div className="flex-1 md:flex-none font-mono text-xs text-text-primary bg-primary-bg px-4 py-3 rounded-lg border border-accent-gold/15 truncate max-w-xs md:max-w-md">
              {contractAddress}
            </div>
            <button
              onClick={handleCopy}
              className="rounded-lg bg-accent-gold p-3 text-primary-bg hover:bg-accent-champagne hover:scale-105 transition-all shadow-md shadow-accent-gold/15"
              title="Copy Contract Address"
            >
              {copied ? <IconCheck className="h-5 w-5" /> : <IconCopy className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {steps.map((step, idx) => (
            <div key={idx} className="glass-panel p-8 flex flex-col gap-4 relative overflow-hidden group">
              <span className="absolute top-2 right-4 font-display text-5xl font-black text-accent-gold/5 group-hover:text-accent-gold/10 transition-colors">
                {step.num}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-base font-bold text-text-primary group-hover:text-accent-gold transition-colors">
                {step.title}
              </h3>
              <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Swap / Buy action banner */}
        <div className="glass-panel p-8 flex flex-col md:flex-row justify-between items-center gap-6 border-accent-gold/15 mb-16">
          <div className="flex flex-col gap-2">
            <h3 className="font-display text-base font-bold text-text-primary">
              Ready to execute your swap?
            </h3>
            <p className="text-xs text-text-secondary">
              Connect to Raydium/Jupiter directly and swap SOL for BELL tokens in a few clicks.
            </p>
          </div>
          <a
            href={crypto?.buyNowUrl || 'https://jup.ag'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-accent-gold px-6 py-3 text-sm font-bold text-primary-bg hover:bg-accent-champagne hover:scale-105 transition-all w-full md:w-auto justify-center"
          >
            Launch Jupiter Exchange
            <IconExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Slippage & safety callout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-text-secondary/70 leading-relaxed">
          <div className="rounded-lg border border-accent-gold/10 bg-surface-glass p-5">
            <h4 className="font-display font-semibold text-accent-gold mb-2 uppercase tracking-wider">
              Slippage Settings Notice
            </h4>
            Standard slippage of 0.5% is typically sufficient. During times of high network congestion or network volatility, you may adjust slippage to 1.0% to guarantee transaction inclusion.
          </div>
          <div className="rounded-lg border border-accent-gold/10 bg-surface-glass p-5">
            <h4 className="font-display font-semibold text-accent-gold mb-2 uppercase tracking-wider">
              Security Warning
            </h4>
            Always verify that the contract address matches our official address before confirming any swaps. Our admins will never direct message you to ask for seed phrases or secret keys.
          </div>
        </div>
      </div>
    </div>
  );
}
