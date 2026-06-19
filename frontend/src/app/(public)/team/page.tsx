// page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  IconBrandLinkedin,
  IconBrandTwitter,
  IconBrandTelegram,
  IconRefresh,
} from '@tabler/icons-react';
import { publicApi } from '@/utils/api';

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string | null;
  linkedin: string | null;
  twitter: string | null;
  telegram: string | null;
  order: number;
  type: 'CORE' | 'ADVISOR' | string;
}

export default function TeamPage() {
  // Fetch team members from API
  const { data: team, isLoading } = useQuery<TeamMember[]>({
    queryKey: ['teamMembers'],
    queryFn: () => publicApi.getTeam(),
  });

  const coreTeam = team?.filter((m) => m.type === 'CORE') || [];
  const advisors = team?.filter((m) => m.type === 'ADVISOR') || [];

  const MemberCard = ({ m }: { m: TeamMember }) => (
    <div className="flip-card w-full h-[320px] rounded-xl cursor-pointer">
      <div className="flip-card-inner w-full h-full glass-panel border border-accent-gold/15 transition-all">
        {/* Front of Card */}
        <div className="flip-card-front w-full h-full flex flex-col items-center justify-center p-6 gap-4">
          <div className="relative h-24 w-24 rounded-full border border-accent-gold bg-accent-gold/5 flex items-center justify-center overflow-hidden">
            {m.photoUrl ? (
              <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-2xl font-bold text-accent-gold">
                {m.name.split(' ').map((n) => n[0]).join('')}
              </span>
            )}
          </div>
          <div className="text-center">
            <h3 className="font-display text-base font-bold text-text-primary mb-1">
              {m.name}
            </h3>
            <span className="text-xs font-semibold tracking-wider text-accent-gold uppercase">
              {m.title}
            </span>
          </div>
          <span className="text-[10px] text-text-secondary/50 uppercase tracking-widest flex items-center gap-1 mt-4">
            <IconRefresh className="h-3.5 w-3.5" />
            Hover to view Bio
          </span>
        </div>

        {/* Back of Card */}
        <div className="flip-card-back w-full h-full flex flex-col justify-between p-6 bg-primary-bg/95 rounded-xl border border-accent-gold/45">
          <div className="flex flex-col gap-3">
            <span className="font-display text-xs font-bold text-accent-gold uppercase tracking-wider text-left border-b border-accent-gold/10 pb-2">
              Biography
            </span>
            <p className="text-xs text-text-secondary leading-relaxed text-left overflow-y-auto max-h-[170px] pr-1">
              {m.bio}
            </p>
          </div>

          {/* Socials */}
          <div className="flex gap-4 justify-center border-t border-accent-gold/10 pt-3">
            {m.linkedin && (
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-gold transition-colors">
                <IconBrandLinkedin className="h-4.5 w-4.5" />
              </a>
            )}
            {m.twitter && (
              <a href={m.twitter} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-gold transition-colors">
                <IconBrandTwitter className="h-4.5 w-4.5" />
              </a>
            )}
            {m.telegram && (
              <a href={m.telegram} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-accent-gold transition-colors">
                <IconBrandTelegram className="h-4.5 w-4.5" />
              </a>
            )}
            {!m.linkedin && !m.twitter && !m.telegram && (
              <span className="text-[10px] italic text-text-secondary/50">No external links</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-16 px-6 relative">
      {/* Background decoration */}
      <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl -z-10" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Ecosystem Stewards
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            Meet Our Team
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            A harmonized blend of DeFi engineers, financial architects, and legacy trust specialists.
          </p>
          <div className="mx-auto h-[1px] w-24 bg-accent-gold/40 mt-2" />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-gold" />
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            {/* Core Team Grid */}
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary uppercase tracking-widest text-accent-gold text-center mb-8">
                Core Leadership
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {coreTeam.map((m) => (
                  <MemberCard key={m.id} m={m} />
                ))}
              </div>
            </div>

            {/* Advisors Grid */}
            {advisors.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-bold text-text-primary uppercase tracking-widest text-accent-gold text-center mb-8">
                  Advisory Board
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {advisors.map((m) => (
                    <MemberCard key={m.id} m={m} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
