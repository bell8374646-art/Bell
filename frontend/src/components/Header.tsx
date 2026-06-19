// Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBell, IconMenu2, IconX, IconWallet } from '@tabler/icons-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Tokenomics', path: '/tokenomics' },
    { name: 'Roadmap', path: '/roadmap' },
    { name: 'Chart', path: '/chart' },
    { name: 'Whitepaper', path: '/whitepaper' },
    { name: 'How to Buy', path: '/how-to-buy' },
    { name: 'Team', path: '/team' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleConnectWallet = () => {
    if (walletAddress) {
      setWalletAddress(null);
    } else {
      // Mock wallet connect
      setWalletAddress('0x71C7...c76F');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent-gold/15 bg-primary-bg/75 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-surface-glass border border-accent-gold/30 group-hover:border-accent-gold/80 transition-all duration-300">
            <IconBell className="h-5 w-5 text-accent-gold group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 -z-10 rounded-full bg-accent-gold/5 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider text-text-primary group-hover:text-accent-gold transition-colors duration-300">
            BELL COIN
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`text-sm font-medium tracking-wide transition-colors duration-300 hover:text-accent-gold ${
                  isActive ? 'text-accent-gold font-semibold border-b border-accent-gold/40' : 'text-text-secondary'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden xl:flex items-center gap-4">
          <button
            onClick={handleConnectWallet}
            className="flex items-center gap-2 rounded-full border border-accent-gold bg-accent-gold/10 px-5 py-2 text-sm font-semibold text-accent-gold hover:bg-accent-gold hover:text-primary-bg transition-all duration-300"
          >
            <IconWallet className="h-4 w-4" />
            {walletAddress ? walletAddress : 'Connect Wallet'}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex xl:hidden items-center gap-4">
          <button
            onClick={handleConnectWallet}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-accent-gold/30 text-accent-gold bg-accent-gold/5"
            aria-label="Connect wallet mobile"
          >
            <IconWallet className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-text-primary hover:text-accent-gold transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <IconX className="h-6 w-6" /> : <IconMenu2 className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden fixed inset-0 top-[73px] z-40 w-full bg-primary-bg/95 backdrop-blur-lg border-t border-accent-gold/15">
          <nav className="flex flex-col items-center gap-6 py-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-lg font-medium tracking-wide hover:text-accent-gold transition-colors ${
                    isActive ? 'text-accent-gold font-semibold' : 'text-text-secondary'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
