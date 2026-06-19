// seed.js
// Seeds the database with default admin user and initial web contents

import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js';

async function main() {
  console.log('Seeding database...');

  // 1. Create default Super Admin
  const email = 'admin@bellcoin.com';
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  let adminId;
  if (!existingUser) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Password123', salt);
    const superAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        totpEnabled: false,
      },
    });
    adminId = superAdmin.id;
    console.log(`Created default Super Admin: ${email} / Password123`);
  } else {
    adminId = existingUser.id;
    console.log(`Admin user ${email} already exists.`);
  }

  // 2. Create Blog Categories
  const categories = ['General', 'Tokenomics', 'Announcements', 'Guides'];
  const categoryMap = {};
  for (const name of categories) {
    const slug = name.toLowerCase();
    const cat = await prisma.blogCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    categoryMap[name] = cat.id;
  }
  console.log('Seeding blog categories completed.');

  // 3. Create initial FAQs (10 questions for launch checklist compliance)
  const faqs = [
    { question: 'What is Bell Coin?', answer: 'Bell Coin is an enterprise-grade cryptocurrency designed to build financial freedom for families through safe, long-term DeFi products.', category: 'GENERAL', order: 1 },
    { question: 'What is the contract address of BELL?', answer: 'The official contract address is 7xKX1v2B8kFqE2pAd8Ad1T2P6Sj4b3g9B1N8xQ2yZ1r9 (mock). Never send funds directly to this address.', category: 'TECHNICAL', order: 2 },
    { question: 'Which wallet should I use?', answer: 'We support Solana-compatible wallets such as Phantom, Solflare, or backpack.', category: 'TECHNICAL', order: 3 },
    { question: 'Is the liquidity locked?', answer: 'Yes, 100% of the initial presale liquidity is locked for a duration of 3 years to prevent rug pulls and build investor trust.', category: 'SECURITY', order: 4 },
    { question: 'What is the total supply?', answer: 'The total supply is fixed at 1,000,000,000 BELL coins. No additional coins can ever be minted.', category: 'TOKENOMICS', order: 5 },
    { question: 'How can I buy Bell Coin?', answer: 'You can buy Bell Coin on decentralized exchanges like Raydium or Jupiter, or directly from our official platform using your Solana wallet.', category: 'BUYING', order: 6 },
    { question: 'What is the transaction slippage rate?', answer: 'We recommend setting your slippage tolerance to 0.5% - 1% on DEX platforms.', category: 'BUYING', order: 7 },
    { question: 'Is the team fully verified?', answer: 'Yes, the core founding team has passed rigorous KYC verification and our smart contracts are fully audited.', category: 'SECURITY', order: 8 },
    { question: 'How does the burn mechanism work?', answer: '0.5% of every transaction is automatically sent to the dead address, gradually shrinking the circulating supply over time.', category: 'TOKENOMICS', order: 9 },
    { question: 'Who is the project built for?', answer: 'Bell Coin is designed specifically for family-oriented investment groups and individual investors looking for stable growth vectors.', category: 'GENERAL', order: 10 },
  ];

  for (const faq of faqs) {
    await prisma.faqItem.create({
      data: faq,
    });
  }
  console.log('Seeding FAQs completed.');

  // 4. Create initial Team Members (3 members for launch checklist)
  const team = [
    { name: 'Marcus Sterling', title: 'Founding CEO & Visionary', bio: 'Former DeFi architect with over 12 years of experience in institutional venture capital and blocktech products.', type: 'CORE', order: 1, linkedin: 'https://linkedin.com/in/marcus' },
    { name: 'Dr. Evelyn Chen', title: 'Chief Blockchain Researcher', bio: 'PhD in Cryptographic Protocols from MIT. Specializes in tokenomics optimization algorithms and secure smart contracts.', type: 'CORE', order: 2, twitter: 'https://x.com/evelyn' },
    { name: 'Richard K. Bell', title: 'Community Growth Director', bio: 'Veteran community builder. Scaled multiple Web3 projects from grassroots groups to multi-million user protocols.', type: 'CORE', order: 3, telegram: 'https://t.me/richard' },
    { name: 'Alexander Hamilton', title: 'Financial Advisor', bio: 'Former corporate treasury head. Advises on liquidity structure, asset positioning, and capital reserve deployment.', type: 'ADVISOR', order: 4 },
  ];

  for (const t of team) {
    await prisma.teamMember.create({
      data: t,
    });
  }
  console.log('Seeding team members completed.');

  // 5. Create initial Roadmap Phases
  const roadmap = [
    { title: 'Phase 1: Foundation & Smart Contracts', date: 'Q1 2026', progress: 100, status: 'COMPLETED', order: 1, milestones: JSON.stringify(['Smart contract audit completed', 'Whitepaper release', 'Community setup on Telegram & X']) },
    { title: 'Phase 2: Platform Launch & Liquidity', date: 'Q2 2026', progress: 75, status: 'IN_PROGRESS', order: 2, milestones: JSON.stringify(['Official platform launch', 'DEX listings on Uniswap', 'Initial marketing rollout']) },
    { title: 'Phase 3: Ecosystem Expansion', date: 'Q3 2026', progress: 0, status: 'UPCOMING', order: 3, milestones: JSON.stringify(['Staking dashboard launch', 'Strategic exchange partnerships', 'Multilingual platform localizations']) },
    { title: 'Phase 4: Global Adoption', date: 'Q4 2026', progress: 0, status: 'UPCOMING', order: 4, milestones: JSON.stringify(['Institutional capital outreach', 'Mobile app release', 'Family-wealth index vaults launch']) },
  ];

  for (const phase of roadmap) {
    await prisma.roadmapPhase.create({
      data: phase,
    });
  }
  console.log('Seeding roadmap completed.');

  // 6. Create default Page Contents
  const pages = [
    {
      slug: 'home',
      title: 'Home Page Content',
      content: JSON.stringify({
        heroHeadline: 'Building Financial Freedom for Generations',
        heroSubtext: 'The enterprise-grade Web3 asset built to secure, grow, and pass down family wealth with confidence.',
        launchCountdown: '2026-12-31T23:59:59.000Z',
        features: [
          { icon: 'shield', title: 'Institutional Trust', desc: 'Fully audited contract structure with locked liquidity and multi-signature operations.' },
          { icon: 'chart', title: 'Deflationary Growth', desc: 'Built-in transaction burn mechanism and automated staking rewards for holders.' },
          { icon: 'users', title: 'Family-First Focus', desc: 'Tools designed to co-manage family assets, inheritance transfers, and junior wallets.' }
        ]
      })
    },
    {
      slug: 'about',
      title: 'About Page Content',
      content: JSON.stringify({
        mission: 'Our mission is to bridge legacy family estate structures with Web3 protocols, offering a premium and safe growth path.',
        vision: 'We envision a future where financial freedom is accessible, compound growth is automated, and transfer of digital assets between generations is frictionless.',
        whyExist: 'Traditional finance charges heavy fees and offers low interest, while standard crypto projects are too volatile for family security. Bell Coin combines safety, premium aesthetics, and long-term staking vectors.'
      })
    },
    {
      slug: 'tokenomics',
      title: 'Tokenomics Settings',
      content: JSON.stringify({
        totalSupply: 1000000000,
        allocation: [
          { label: 'Presale / Public Sale', value: 40, color: '#D4AF37' },
          { label: 'Liquidity Pool Lock', value: 30, color: '#F5E6A3' },
          { label: 'Reserve & Ecosystem Staking', value: 15, color: '#B0B3B8' },
          { label: 'Marketing & Strategic Growth', value: 10, color: '#1A1A2E' },
          { label: 'Core Team (Vested)', value: 5, color: '#0A0A0B' }
        ],
        vesting: 'Team tokens are locked for 12 months with a 36-month linear vest thereafter. Reserve tokens are locked for 6 months.'
      })
    }
  ];

  for (const p of pages) {
    await prisma.pageContent.create({
      data: p,
    });
  }
  console.log('Seeding page contents completed.');

  // 7. Seed initial blog posts
  await prisma.blogPost.create({
    data: {
      title: 'Welcome to Bell Coin: Empowering Families via Web3',
      slug: 'welcome-to-bell-coin-empowering-families',
      content: '<p>Welcome to Bell Coin! We are thrilled to officially launch the platform and share our roadmap for long-term compound growth. In this article, we explain our core mission, our security integrations, and how you can participate in the early presale stages.</p><p>We believe that digital assets will represent a huge portion of family wealth in the coming decade. Our goal is to make it easy, secure, and prestigious to manage this wealth.</p>',
      excerpt: 'The official welcome blog post introducing Bell Coin features, vision, and core team members.',
      status: 'PUBLISHED',
      publishAt: new Date(),
      readingTime: 3,
      featured: true,
      categoryId: categoryMap['General'],
      authorId: adminId,
    }
  });
  console.log('Seeding initial blog post completed.');

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
