'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  IconCircleCheck,
  IconClock,
  IconCalendarEvent,
  IconArrowRight,
  IconEdit,
} from '@tabler/icons-react';
import { publicApi } from '@/utils/api';

interface RoadmapPhase {
  id: string;
  title: string;
  date: string;
  order: number;
  progress: number;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | string;
  milestones: string; // JSON array string
}

export default function RoadmapPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
      setIsAdmin(true);
    }
  }, []);

  // Fetch roadmap phases from API
  const { data: phases, isLoading } = useQuery<RoadmapPhase[]>({
    queryKey: ['roadmapPhases'],
    queryFn: () => publicApi.getRoadmap(),
  });

  return (
    <div className="py-16 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl -z-10" />

      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Development Journey
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            Ecosystem Roadmap
          </h1>
          {isAdmin && (
            <Link
              href="/admin/dashboard"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  // In case we want to navigate directly to the roadmap tab
                  // We can't set state across page boundaries easily, but it's okay, they'll land on dashboard
                }
              }}
              className="mt-2 mx-auto flex items-center gap-2 rounded-full border border-accent-gold/40 bg-accent-gold/15 px-4 py-1.5 text-xs font-bold text-accent-gold hover:bg-accent-gold hover:text-primary-bg transition-all duration-300 w-fit"
            >
              <IconEdit className="h-3.5 w-3.5" />
              Edit in Admin Panel
            </Link>
          )}
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Follow our milestones as we build the premier financial freedom platform for families.
          </p>
          <div className="mx-auto h-[1px] w-24 bg-accent-gold/40 mt-2" />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-gold" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:overflow-x-auto pb-8 snap-x">
            {phases?.map((phase) => {
              const milestonesList: string[] = JSON.parse(phase.milestones);
              const isCompleted = phase.status === 'COMPLETED';
              const isInProgress = phase.status === 'IN_PROGRESS';

              return (
                <div
                  key={phase.id}
                  className={`glass-panel p-6 shrink-0 w-full lg:w-[320px] snap-center flex flex-col gap-5 border transition-all duration-300 ${
                    isInProgress ? 'border-accent-gold bg-accent-gold/5 animate-pulse-gold' : 'border-accent-gold/15'
                  }`}
                >
                  {/* Status header */}
                  <div className="flex justify-between items-center">
                    <span className="font-display text-xs font-bold text-accent-gold flex items-center gap-1">
                      <IconCalendarEvent className="h-4 w-4" />
                      {phase.date}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                        isCompleted
                          ? 'border-green-500/30 bg-green-500/10 text-green-400'
                          : isInProgress
                          ? 'border-accent-gold/40 bg-accent-gold/15 text-accent-gold'
                          : 'border-text-secondary/20 bg-surface-glass text-text-secondary/70'
                      }`}
                    >
                      {phase.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Progress */}
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-base font-bold text-text-primary group-hover:text-accent-gold leading-snug">
                      {phase.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-primary-bg rounded-full h-1.5 overflow-hidden border border-accent-gold/10">
                        <div
                          className="bg-accent-gold h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${phase.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-text-secondary">{phase.progress}%</span>
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div className="flex-1 flex flex-col gap-2.5 border-t border-accent-gold/10 pt-4">
                    {milestonesList.map((m, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-xs text-text-secondary leading-relaxed">
                        {isCompleted ? (
                          <IconCircleCheck className="h-4.5 w-4.5 text-accent-gold shrink-0 mt-0.5" />
                        ) : (
                          <IconClock className="h-4.5 w-4.5 text-accent-gold/50 shrink-0 mt-0.5" />
                        )}
                        <span>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {(!phases || phases.length === 0) && (
              <div className="text-center py-12 w-full text-text-secondary">
                No roadmap phases found. Please populate them from the Admin panel.
              </div>
            )}
          </div>
        )}

        {/* Next step notice */}
        <div className="mt-16 text-center max-w-md mx-auto border border-accent-gold/15 rounded-full px-6 py-3 bg-surface-glass/40 text-xs flex items-center justify-center gap-2 font-medium">
          <span>We are actively executing Phase 2 milestones</span>
          <IconArrowRight className="h-4 w-4 text-accent-gold animate-bounce" />
        </div>
      </div>
    </div>
  );
}
