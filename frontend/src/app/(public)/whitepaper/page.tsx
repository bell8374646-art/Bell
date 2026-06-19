// page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  IconDownload,
  IconBook,
  IconList,
  IconFileText,
} from '@tabler/icons-react';
import { publicApi } from '@/utils/api';
import { useAnalytics } from '@/hooks/useAnalytics';

interface Chapter {
  id: string;
  title: string;
  content: string;
}

export default function WhitepaperPage() {
  const { logAction } = useAnalytics();
  const [activeChapter, setActiveChapter] = useState('executive-summary');
  const [pdfUrl, setPdfUrl] = useState('/bell-coin-whitepaper.pdf');

  // Fetch crypto/global settings to locate uploaded PDF
  const { data: crypto } = useQuery({
    queryKey: ['cryptoSettings'],
    queryFn: () => publicApi.getCryptoSettings(),
  });

  const chapters: Chapter[] = [
    {
      id: 'executive-summary',
      title: '1. Executive Summary',
      content: 'Bell Coin represents a paradigm shift in family wealth stewardship. By merging elite cryptographic safety parameters with intuitive DeFi yield triggers, BELL equips family offices and individual heads-of-households with compound storage options. Our core pillar is absolute trust, enforced via locked liquidity pools and audited contracts.',
    },
    {
      id: 'problem-statement',
      title: '2. The Problem Statement',
      content: 'Legacy family wealth transfer vectors (trust funds, wills, and custody accounts) are bound by expensive fee structures, delayed timelines, and archaic legal processes. Existing Web3 assets, while offering compound growth, are far too volatile, lack generational transfer guardrails, and are targeted by predatory MEV bot snipers.',
    },
    {
      id: 'bell-coin-protocol',
      title: '3. Bell Coin Protocols',
      content: 'Our protocol implements locked staking pools yielding competitive percentage yields, matched with a transaction burn rate. Dynamic allowance smart contracts allow parents to release pre-allotted allowances to junior beneficiary wallets upon execution of pre-defined threshold activities or calendar dates.',
    },
    {
      id: 'token-allocation',
      title: '4. Allocation & Governance',
      content: 'A total fixed supply of 21,000,000 BELL is minted. 40% goes to public presale, 30% permanently locked in Raydium liquidity pools, 15% reserve staking yields, 10% ecosystem marketing, and 5% vested core developer pools. Governance votes are settled based on holding multipliers over time.',
    },
    {
      id: 'security-matrix',
      title: '5. Security Architecture',
      content: 'All smart contract deployments are audited by top tier blockchain security firms. All state alterations in the core treasury require 3-out-of-5 multi-signature keys held across distinct cryptographic vault nodes. Burn fees are hardcoded at the contract level and cannot be adjusted.',
    },
  ];

  const handleDownload = () => {
    logAction('download_whitepaper', { url: pdfUrl });
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="py-16 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Hero header */}
        <div className="text-center mb-12 flex flex-col items-center gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Technical Specification
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            Bell Coin Whitepaper
          </h1>
          <p className="text-text-secondary max-w-2xl leading-relaxed">
            Read our core engineering parameters, deflationary allocations, and wealth transfer protocol architectures.
          </p>

          <button
            onClick={handleDownload}
            className="mt-4 flex items-center gap-2 rounded-full bg-accent-gold px-6 py-3 text-sm font-bold text-primary-bg hover:bg-accent-champagne hover:scale-105 transition-all shadow-md shadow-accent-gold/25"
          >
            <IconDownload className="h-4 w-4" />
            Download PDF Version
          </button>
          <div className="mx-auto h-[1px] w-24 bg-accent-gold/40 mt-6" />
        </div>

        {/* Index and Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Index Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <div className="glass-panel p-4 flex flex-col gap-2">
              <span className="font-display text-xs font-bold text-accent-gold uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                <IconList className="h-4 w-4" />
                Chapters Index
              </span>
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`text-left text-xs font-medium px-3 py-2.5 rounded-lg transition-all ${
                    activeChapter === ch.id
                      ? 'bg-accent-gold/15 text-accent-gold border-l-2 border-accent-gold'
                      : 'text-text-secondary hover:bg-surface-glass hover:text-text-primary'
                  }`}
                >
                  {ch.title}
                </button>
              ))}
            </div>
          </div>

          {/* Chapters Content */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* HTML Chapter Preview */}
            <div className="glass-panel p-8 min-h-[300px] flex flex-col gap-4">
              {chapters
                .filter((ch) => ch.id === activeChapter)
                .map((ch) => (
                  <div key={ch.id} className="flex flex-col gap-4">
                    <h2 className="font-display text-lg md:text-xl font-bold text-accent-gold">
                      {ch.title}
                    </h2>
                    <p className="text-sm md:text-base text-text-secondary leading-relaxed font-body whitespace-pre-wrap">
                      {ch.content}
                    </p>
                  </div>
                ))}
            </div>

            {/* Embedded PDF Viewer Box */}
            <div className="glass-panel p-4 flex flex-col gap-4">
              <span className="font-display text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <IconFileText className="h-4 w-4 text-accent-gold" />
                Live PDF Document Preview
              </span>
              <div className="w-full h-[500px] rounded-lg bg-primary-bg overflow-hidden border border-accent-gold/10">
                <embed
                  src={`${pdfUrl}#toolbar=0&navpanes=0`}
                  type="application/pdf"
                  className="w-full h-full"
                  onError={() => {
                    console.warn('PDF Embed failed, showing fallback preview link');
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
