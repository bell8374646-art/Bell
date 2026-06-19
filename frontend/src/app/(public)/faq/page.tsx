// page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IconSearch,
  IconChevronDown,
  IconChevronUp,
  IconHelp,
} from '@tabler/icons-react';
import { publicApi } from '@/utils/api';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'GENERAL' | 'TOKENOMICS' | 'TECHNICAL' | 'BUYING' | 'SECURITY' | string;
  order: number;
}

export default function FaqPage() {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch FAQs from API
  const { data: faqs, isLoading } = useQuery<FaqItem[]>({
    queryKey: ['faqItems'],
    queryFn: () => publicApi.getFaq(),
  });

  const categories = ['ALL', 'GENERAL', 'TOKENOMICS', 'TECHNICAL', 'BUYING', 'SECURITY'];

  // Filter FAQs
  const filteredFaqs = faqs?.filter((item) => {
    const matchesTab = activeTab === 'ALL' || item.category === activeTab;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="py-16 px-6 relative">
      {/* Background radial glow */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-accent-gold/5 blur-3xl -z-10" />

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col gap-4">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Support Center
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary">
            Frequently Asked Questions
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Search our databases for answers regarding contract safety, token transfers, allocations, and wallet connections.
          </p>
          <div className="mx-auto h-[1px] w-24 bg-accent-gold/40 mt-2" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-10 w-full max-w-xl mx-auto">
          <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary/50" />
          <input
            type="text"
            placeholder="Search questions or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-accent-gold/15 bg-surface-glass/40 pl-12 pr-6 py-3.5 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent-gold focus:bg-primary-bg outline-none transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                setExpandedId(null); // collapse all when switching tabs
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all ${
                activeTab === cat
                  ? 'border-accent-gold bg-accent-gold/15 text-accent-gold shadow-md'
                  : 'border-accent-gold/15 bg-surface-glass/30 text-text-secondary hover:border-accent-gold/40 hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordions List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-gold" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredFaqs?.map((faq) => {
              const isExpanded = expandedId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="glass-panel border-accent-gold/15 overflow-hidden transition-all duration-300"
                >
                  {/* Trigger Header */}
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full flex justify-between items-center p-6 text-left hover:bg-accent-gold/5 transition-colors gap-4"
                  >
                    <span className="font-display text-sm md:text-base font-bold text-text-primary hover:text-accent-gold transition-colors flex items-center gap-2">
                      <IconHelp className="h-4.5 w-4.5 text-accent-gold shrink-0" />
                      {faq.question}
                    </span>
                    <span className="text-accent-gold">
                      {isExpanded ? <IconChevronUp className="h-5 w-5" /> : <IconChevronDown className="h-5 w-5" />}
                    </span>
                  </button>

                  {/* Accordion Content via Framer Motion */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        <div className="px-6 pb-6 pt-2 text-xs md:text-sm text-text-secondary leading-relaxed border-t border-accent-gold/10 font-body">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {(!filteredFaqs || filteredFaqs.length === 0) && (
              <div className="text-center py-12 text-text-secondary">
                No matching questions found. Try refining your search query.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
