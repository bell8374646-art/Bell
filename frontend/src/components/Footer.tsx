// Footer.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { IconBell, IconCopy, IconCheck, IconBrandTelegram, IconBrandTwitter, IconBrandDiscord } from '@tabler/icons-react';

import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/utils/api';

export default function Footer() {
  const [copied, setCopied] = useState(false);

  // Fetch settings for dynamic contract address
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

  return (
    <footer className="w-full border-t border-accent-gold/15 bg-primary-bg py-12 text-text-secondary">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <IconBell className="h-6 w-6 text-accent-gold" />
              <span className="font-display text-lg font-bold tracking-wider text-text-primary">
                BELL COIN
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              &ldquo;A New Way to Build Financial Freedom for Families.&rdquo; Bridging security, wealth accumulation, and generational transfer.
            </p>
            <div className="flex gap-4 items-center mt-2">
              <a href="https://t.me/bellcoin0" target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors">
                <IconBrandTelegram className="h-5 w-5" />
              </a>
              <a href="https://x.com/BellCoin0" target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors">
                <IconBrandTwitter className="h-5 w-5" />
              </a>
              <a href="https://discord.gg/bellcoin" target="_blank" rel="noopener noreferrer" className="hover:text-accent-gold transition-colors">
                <IconBrandDiscord className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wider text-text-primary mb-4">
              PLATFORM
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-accent-gold transition-colors">About Team</Link>
              </li>
              <li>
                <Link href="/tokenomics" className="hover:text-accent-gold transition-colors">Tokenomics</Link>
              </li>
              <li>
                <Link href="/roadmap" className="hover:text-accent-gold transition-colors">Roadmap</Link>
              </li>
              <li>
                <Link href="/whitepaper" className="hover:text-accent-gold transition-colors">Whitepaper PDF</Link>
              </li>
            </ul>
          </div>

          {/* Guides & Tools */}
          <div>
            <h4 className="font-display text-sm font-semibold tracking-wider text-text-primary mb-4">
              RESOURCES
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/how-to-buy" className="hover:text-accent-gold transition-colors">How to Buy</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-accent-gold transition-colors">FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent-gold transition-colors">Contact Form</Link>
              </li>

            </ul>
          </div>

          {/* Contract copy */}
          <div className="flex flex-col gap-4">
            <h4 className="font-display text-sm font-semibold tracking-wider text-text-primary">
              CONTRACT ADDRESS
            </h4>
            <div className="relative flex items-center justify-between rounded-lg border border-accent-gold/15 bg-surface-glass p-3 text-xs font-mono text-text-primary">
              <span className="truncate pr-4">{contractAddress}</span>
              <button
                onClick={handleCopy}
                className="text-accent-gold hover:text-accent-champagne transition-colors"
                title="Copy Address"
              >
                {copied ? <IconCheck className="h-4 w-4" /> : <IconCopy className="h-4 w-4" />}
              </button>
            </div>
            <span className="text-xs text-text-secondary">
              Network: Solana Mainnet (SPL)
            </span>
          </div>
        </div>

        {/* Disclaimer & Bottom */}
        <div className="border-t border-accent-gold/10 pt-8 text-xs leading-relaxed text-text-secondary/70">
          <p className="mb-6">
            <strong>Disclaimer:</strong> Cryptocurrency investments are subject to high market risk. Bell Coin (BELL) is a decentralized utility token. Information provided on this website does not constitute financial, investment, or trading advice. Always perform your own research and consult with financial advisors before participating in any token events.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-secondary/50">
            <span>© {new Date().getFullYear()} Bell Coin. All rights reserved.</span>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-accent-gold transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-accent-gold transition-colors">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
