// layout.tsx
import type { Metadata } from 'next';
import { Inter, Orbitron } from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
});

const orbitron = Orbitron({
  variable: '--font-display',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Bell Coin — Enterprise Cryptocurrency Platform',
  description: 'Bell Coin – A New Way to Build Financial Freedom for Families',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} scroll-smooth`}>
      <body className="antialiased min-h-screen bg-primary-bg text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
