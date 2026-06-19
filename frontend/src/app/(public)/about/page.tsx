// page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  IconEye,
  IconTarget,
  IconUsers,
  IconScale,
  IconShieldLock,
  IconHeart,
} from '@tabler/icons-react';
import { publicApi } from '@/utils/api';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function AboutPage() {
  const { logAction } = useAnalytics();

  const { data: cmsAbout } = useQuery({
    queryKey: ['cmsAbout'],
    queryFn: () => publicApi.getPage('about'),
  });

  const aboutData = cmsAbout ? JSON.parse(cmsAbout.content) : {
    mission: 'Our mission is to bridge legacy family estate structures with Web3 protocols, offering a premium and safe growth path.',
    vision: 'We envision a future where financial freedom is accessible, compound growth is automated, and transfer of digital assets between generations is frictionless.',
    whyExist: 'Traditional finance charges heavy fees and offers low interest, while standard crypto projects are too volatile for family security. Bell Coin combines safety, premium aesthetics, and long-term staking vectors.'
  };

  const values = [
    { icon: IconShieldLock, title: 'Absolute Safety', desc: 'Our smart contracts are fully audited, and the developer pool liquidity is permanently locked.' },
    { icon: IconScale, title: 'Compliance & Ethics', desc: 'We align our platform development with compliance baselines and standard digital asset frameworks.' },
    { icon: IconUsers, title: 'Community Growth', desc: 'Grassroots, family-first distribution maps to prioritize community holders over institutional snipers.' },
    { icon: IconHeart, title: 'Generational Transfer', desc: 'Active smart contract vault protocols to transition digital holdings safely to junior beneficiaries.' },
  ];

  return (
    <div className="relative py-16 px-6">
      {/* Background radial highlight */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl -z-10" />

      <div className="mx-auto max-w-5xl">
        {/* Parallax style Hero header */}
        <div className="text-center mb-16 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Learn About Bell Coin
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            Mission & Vision
          </h1>
          <div className="mx-auto h-[1px] w-24 bg-accent-gold/40 mt-2" />
        </div>

        {/* Mission & Vision blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="glass-panel p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
              <IconTarget className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary">Our Mission</h3>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-body">
              {aboutData.mission}
            </p>
          </div>

          <div className="glass-panel p-8 flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
              <IconEye className="h-6 w-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-text-primary">Our Vision</h3>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed font-body">
              {aboutData.vision}
            </p>
          </div>
        </div>

        {/* Why We Exist Storytelling */}
        <div className="glass-panel p-8 md:p-12 mb-16 flex flex-col gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-accent-gold/5 blur-2xl" />
          <h2 className="font-display text-xl md:text-3xl font-bold text-text-primary">
            Why We Exist
          </h2>
          <p className="text-sm md:text-base text-text-secondary leading-relaxed font-body">
            {aboutData.whyExist}
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="mb-20">
          <h3 className="font-display text-lg font-bold text-text-primary text-center mb-8 uppercase tracking-widest text-accent-gold">
            Our Core Values
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div key={i} className="glass-panel glass-panel-hover p-6 flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold">
                  <v.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-1">
                  <h4 className="font-display text-base font-bold text-text-primary">{v.title}</h4>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Built for Families details */}
        <div className="glass-panel border-accent-gold/25 p-8 md:p-12 text-center flex flex-col items-center gap-6 mb-16 shadow-lg shadow-accent-gold/5">
          <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary">
            Built for Families
          </h3>
          <p className="text-sm md:text-base text-text-secondary max-w-3xl leading-relaxed">
            At Bell Coin, we build services that help parents onboard their kids into digital finance safely, lock reserve tokens for trust funds, and manage compound staking benefits without prior blockchain coding knowledge.
          </p>
        </div>

        {/* Legal Disclaimer Block */}
        <div className="rounded-lg border border-accent-gold/10 bg-surface-glass p-6 text-xs text-text-secondary/60 leading-relaxed text-center">
          <p className="uppercase tracking-wider font-semibold text-accent-gold mb-2">Notice regarding safety</p>
          Bell Coin is a technology platform and a utility token. We do not solicit investments directly. All smart contract interactives carry mathematical risk. Prior performance of smart contract rewards is not a guarantee of future token valuation.
        </div>
      </div>
    </div>
  );
}
