// update-settings-to-solana.js
import prisma from './src/config/db.js';

async function main() {
  const existing = await prisma.cryptoSetting.findFirst();
  if (existing) {
    await prisma.cryptoSetting.update({
      where: { id: existing.id },
      data: {
        decimals: 9,
        contractAddress: '7xKX1v2B8kFqE2pAd8Ad1T2P6Sj4b3g9B1N8xQ2yZ1r9',
        network: 'Solana Mainnet',
        buyNowUrl: 'https://jup.ag',
        exchangeLinks: JSON.stringify([
          { name: 'Raydium', pair: 'BELL/SOL', url: 'https://raydium.io' },
        ]),
        supportedWallets: JSON.stringify(['Phantom', 'Solflare', 'backpack']),
        rpcEndpoints: JSON.stringify([
          { network: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com' },
        ]),
      }
    });
    console.log('Successfully updated existing CryptoSetting in DB to Solana.');
  } else {
    console.log('No CryptoSetting row found to update.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
