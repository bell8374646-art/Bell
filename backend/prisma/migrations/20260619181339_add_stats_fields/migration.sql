-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CryptoSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenName" TEXT NOT NULL DEFAULT 'Bell Coin',
    "symbol" TEXT NOT NULL DEFAULT 'BELL',
    "decimals" INTEGER NOT NULL DEFAULT 18,
    "contractAddress" TEXT NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    "network" TEXT NOT NULL DEFAULT 'Ethereum Mainnet',
    "logoUrl" TEXT,
    "coingeckoId" TEXT,
    "cmcId" TEXT,
    "buyNowUrl" TEXT NOT NULL DEFAULT 'https://uniswap.org',
    "exchangeLinks" TEXT NOT NULL,
    "walletConnectProjectId" TEXT,
    "supportedWallets" TEXT NOT NULL,
    "rpcEndpoints" TEXT NOT NULL,
    "priceSource" TEXT NOT NULL DEFAULT 'MANUAL',
    "manualPrice" REAL NOT NULL DEFAULT 0.01,
    "cacheTtl" INTEGER NOT NULL DEFAULT 60,
    "manualHolders" INTEGER NOT NULL DEFAULT 1540,
    "manualVolume" REAL NOT NULL DEFAULT 384200,
    "manualMarketCap" REAL NOT NULL DEFAULT 12500000
);
INSERT INTO "new_CryptoSetting" ("buyNowUrl", "cacheTtl", "cmcId", "coingeckoId", "contractAddress", "decimals", "exchangeLinks", "id", "logoUrl", "manualPrice", "network", "priceSource", "rpcEndpoints", "supportedWallets", "symbol", "tokenName", "walletConnectProjectId") SELECT "buyNowUrl", "cacheTtl", "cmcId", "coingeckoId", "contractAddress", "decimals", "exchangeLinks", "id", "logoUrl", "manualPrice", "network", "priceSource", "rpcEndpoints", "supportedWallets", "symbol", "tokenName", "walletConnectProjectId" FROM "CryptoSetting";
DROP TABLE "CryptoSetting";
ALTER TABLE "new_CryptoSetting" RENAME TO "CryptoSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
