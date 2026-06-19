// crypto.controller.js
// Handles cryptocurrency details, exchange lists, wallet configurations, and live price feeds

import prisma from '../config/db.js';
import logger from '../config/logger.js';

// Simple in-memory cache for live price
let priceCache = {
  price: null,
  timestamp: 0,
};

async function fetchLivePrice(settings) {
  const now = Date.now();
  const ttlMs = (settings.cacheTtl || 60) * 1000;

  // Check cache validity
  if (priceCache.price !== null && now - priceCache.timestamp < ttlMs) {
    return priceCache.price;
  }

  // Determine source
  if (settings.priceSource === 'COINGECKO' && settings.coingeckoId) {
    try {
      const url = `https://api.coingecko.com/api/v3/simple/price?ids=${settings.coingeckoId}&vs_currencies=usd`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data[settings.coingeckoId] && data[settings.coingeckoId].usd !== undefined) {
        const price = data[settings.coingeckoId].usd;
        priceCache = { price, timestamp: now };
        logger.info(`CoinGecko price fetched for ${settings.coingeckoId}: $${price}`);
        return price;
      }
    } catch (err) {
      logger.error(`CoinGecko fetch failed: ${err.message}. Falling back to manual price.`);
    }
  }

  // Fallback to manual override
  logger.info(`Using manual price: $${settings.manualPrice}`);
  return settings.manualPrice;
}

export async function getCryptoSettings(req, res) {
  try {
    let settings = await prisma.cryptoSetting.findFirst();
    if (!settings) {
      // Create defaults if not exists
      settings = await prisma.cryptoSetting.create({
        data: {
          tokenName: 'Bell Coin',
          symbol: 'BELL',
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
          priceSource: 'MANUAL',
          manualPrice: 0.0125,
          cacheTtl: 60,
          manualHolders: 1540,
          manualVolume: 384200,
          manualMarketCap: 12500000,
        },
      });
    }

    // Parse JSON strings
    const formatted = {
      ...settings,
      exchangeLinks: JSON.parse(settings.exchangeLinks),
      supportedWallets: JSON.parse(settings.supportedWallets),
      rpcEndpoints: JSON.parse(settings.rpcEndpoints),
    };

    // Append live price feed
    const livePrice = await fetchLivePrice(settings);
    formatted.livePrice = livePrice;
    formatted.marketCap = (settings.manualMarketCap && settings.manualMarketCap > 0)
      ? settings.manualMarketCap
      : (livePrice * 21000000); // Dynamic calculated total supply 21 Million

    return res.status(200).json({ success: true, data: formatted, error: null });
  } catch (err) {
    logger.error(`Get crypto settings error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}

export async function updateCryptoSettings(req, res) {
  try {
    const {
      tokenName,
      symbol,
      decimals,
      contractAddress,
      network,
      logoUrl,
      coingeckoId,
      cmcId,
      buyNowUrl,
      exchangeLinks,
      walletConnectProjectId,
      supportedWallets,
      rpcEndpoints,
      priceSource,
      manualPrice,
      cacheTtl,
      manualHolders,
      manualVolume,
      manualMarketCap,
    } = req.body;

    const existing = await prisma.cryptoSetting.findFirst();

    const data = {
      tokenName,
      symbol,
      decimals: decimals !== undefined ? Number(decimals) : undefined,
      contractAddress,
      network,
      logoUrl,
      coingeckoId,
      cmcId,
      buyNowUrl,
      walletConnectProjectId,
      priceSource,
      manualPrice: manualPrice !== undefined ? Number(manualPrice) : undefined,
      cacheTtl: cacheTtl !== undefined ? Number(cacheTtl) : undefined,
      manualHolders: manualHolders !== undefined ? Number(manualHolders) : undefined,
      manualVolume: manualVolume !== undefined ? Number(manualVolume) : undefined,
      manualMarketCap: manualMarketCap !== undefined ? Number(manualMarketCap) : undefined,
    };

    if (exchangeLinks) {
      data.exchangeLinks = typeof exchangeLinks === 'string' ? exchangeLinks : JSON.stringify(exchangeLinks);
    }
    if (supportedWallets) {
      data.supportedWallets = typeof supportedWallets === 'string' ? supportedWallets : JSON.stringify(supportedWallets);
    }
    if (rpcEndpoints) {
      data.rpcEndpoints = typeof rpcEndpoints === 'string' ? rpcEndpoints : JSON.stringify(rpcEndpoints);
    }

    let updated;
    if (existing) {
      updated = await prisma.cryptoSetting.update({
        where: { id: existing.id },
        data,
      });
    } else {
      updated = await prisma.cryptoSetting.create({
        data: {
          ...data,
          exchangeLinks: data.exchangeLinks || '[]',
          supportedWallets: data.supportedWallets || '[]',
          rpcEndpoints: data.rpcEndpoints || '[]',
        },
      });
    }

    // Invalidate price cache
    priceCache = { price: null, timestamp: 0 };

    return res.status(200).json({ success: true, data: updated, error: null });
  } catch (err) {
    logger.error(`Update crypto settings error: ${err.message}`);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
}
