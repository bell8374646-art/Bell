// page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  IconFlame,
  IconLock,
  IconCoins,
  IconHourglassEmpty,
  IconAward,
  IconRocket,
} from '@tabler/icons-react';
import { publicApi } from '@/utils/api';
import { useAnalytics } from '@/hooks/useAnalytics';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TokenomicsPage() {
  const { logAction } = useAnalytics();
  const [supplyCounter, setSupplyCounter] = useState(0);

  // Fetch tokenomics data
  const { data: cmsTokenomics } = useQuery({
    queryKey: ['cmsTokenomics'],
    queryFn: () => publicApi.getPage('tokenomics'),
  });

  const tokenomicsData = cmsTokenomics ? JSON.parse(cmsTokenomics.content) : {
    totalSupply: 1000000000,
    allocation: [
      { label: 'Presale / Public Sale', value: 40, color: '#D4AF37' },
      { label: 'Liquidity Pool Lock', value: 30, color: '#F5E6A3' },
      { label: 'Reserve & Ecosystem Staking', value: 15, color: '#B0B3B8' },
      { label: 'Marketing & Strategic Growth', value: 10, color: '#1A1A2E' },
      { label: 'Core Team (Vested)', value: 5, color: '#0A0A0B' }
    ],
    vesting: 'Team tokens are locked for 12 months with a 36-month linear vest thereafter. Reserve tokens are locked for 6 months.'
  };

  // Supply counter animation on page load
  useEffect(() => {
    let start = 0;
    const end = tokenomicsData.totalSupply || 1000000000;
    const duration = 1500; // 1.5s
    const increment = Math.ceil(end / (duration / 16)); // ~60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setSupplyCounter(end);
      } else {
        setSupplyCounter(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [tokenomicsData.totalSupply]);

  // Chart config
  const chartData = {
    labels: tokenomicsData.allocation.map((item: any) => item.label),
    datasets: [
      {
        data: tokenomicsData.allocation.map((item: any) => item.value),
        backgroundColor: tokenomicsData.allocation.map((item: any) => item.color),
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
    <div className="py-16 px-6">
      <div className="mx-auto max-w-5xl">
        {/* Hero supply counter */}
        <div className="text-center mb-16 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Token Structure & Metrics
          </span>
          <h1 className="font-display text-sm md:text-base font-semibold tracking-wider text-text-secondary uppercase">
            Total Fixed Supply
          </h1>
          <div className="font-display text-4xl md:text-6xl font-black text-accent-gold tracking-wider gold-text-gradient">
            {supplyCounter.toLocaleString()} BELL
          </div>
          <div className="mx-auto h-[1px] w-24 bg-accent-gold/40 mt-2" />
        </div>

        {/* Chart and breakdown table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div className="glass-panel p-8 min-h-[350px] relative flex justify-center items-center">
            <div className="w-full h-[300px]">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="font-display text-lg font-bold text-text-primary uppercase tracking-wide">
              Token Allocation
            </h3>
            <div className="overflow-x-auto rounded-lg border border-accent-gold/15 bg-surface-glass">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-accent-gold/15 text-text-secondary text-xs uppercase tracking-wider bg-primary-bg/40">
                    <th className="p-4">Allocation Segment</th>
                    <th className="p-4 text-right">Percentage</th>
                    <th className="p-4 text-right">Tokens Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent-gold/10">
                  {tokenomicsData.allocation.map((item: any, i: number) => {
                    const amount = (tokenomicsData.totalSupply * item.value) / 100;
                    return (
                      <tr key={i} className="hover:bg-accent-gold/5 transition-colors">
                        <td className="p-4 flex items-center gap-2 font-medium">
                          <span className="h-3.5 w-3.5 rounded-full shrink-0 border border-accent-gold/25" style={{ backgroundColor: item.color }} />
                          {item.label}
                        </td>
                        <td className="p-4 text-right font-bold text-accent-gold">{item.value}%</td>
                        <td className="p-4 text-right font-mono text-xs">{amount.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Vesting Schedule */}
        <div className="glass-panel p-8 mb-16 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-accent-gold/5 blur-2xl -z-10" />
          <div className="flex items-center gap-3">
            <IconLock className="h-6 w-6 text-accent-gold" />
            <h3 className="font-display text-lg font-bold text-text-primary">
              Vesting Schedule
            </h3>
          </div>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed font-body">
            {tokenomicsData.vesting}
          </p>
        </div>

        {/* Burn mechanism & utility details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="glass-panel p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
              <IconFlame className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary">Burn Mechanism</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every on-chain transfer of BELL triggers a 0.5% transaction fee which is automatically routed to a verifiably dead address. This creates constant buying pressure and shrinks supply.
            </p>
          </div>

          <div className="glass-panel p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
              <IconCoins className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary">Token Utility</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              BELL acts as the core transactional gas and reward settlement unit across all upcoming family staking vaults, junior digital allowance contracts, and community DAO votings.
            </p>
          </div>
        </div>

        {/* Utility categories grid */}
        <div>
          <h3 className="font-display text-lg font-bold text-text-primary text-center mb-8 uppercase tracking-widest text-accent-gold">
            Ecosystem Incentives
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: IconHourglassEmpty, title: 'Yield Staking', desc: 'Lock tokens in the family treasury vaults for 1, 3, or 5 years to accrue compound staking rewards paid in BELL.' },
              { icon: IconAward, title: 'Generational Rewards', desc: 'Long-term holders accumulate points scaling up reward shares for platform transactions.' },
              { icon: IconRocket, title: 'Launchpad Access', desc: 'Holders get priority allocation whitelist slots in partner family DeFi project launches.' },
            ].map((u, i) => (
              <div key={i} className="glass-panel p-6 flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                  <u.icon className="h-5 w-5" />
                </div>
                <h4 className="font-display text-base font-bold text-text-primary">{u.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
