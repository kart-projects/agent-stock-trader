'use client';

import Image from 'next/image';
import { useState } from 'react';

interface CompanyLogoProps {
  symbol: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Map crypto symbols to their domains
const cryptoToDomain: Record<string, string> = {
  'BTC-USD': 'bitcoin.org',
  'ETH-USD': 'ethereum.org',
  'BNB-USD': 'binance.com',
  'XRP-USD': 'ripple.com',
  'ADA-USD': 'cardano.org',
  'DOGE-USD': 'dogecoin.com',
  'SOL-USD': 'solana.com',
  'DOT-USD': 'polkadot.network',
  'MATIC-USD': 'polygon.technology',
  'LTC-USD': 'litecoin.org',
  'AVAX-USD': 'avax.network',
  'LINK-USD': 'chain.link',
  'UNI-USD': 'uniswap.org',
  'ATOM-USD': 'cosmos.network',
};

// Map stock symbols to their company domains for logo API
const symbolToDomain: Record<string, string> = {
  AAPL: 'apple.com',
  MSFT: 'microsoft.com',
  GOOGL: 'google.com',
  GOOG: 'google.com',
  AMZN: 'amazon.com',
  NVDA: 'nvidia.com',
  TSLA: 'teslamotors.com',
  META: 'facebook.com',
  JPM: 'jpmorganchase.com',
  V: 'visa.com',
  MA: 'mastercard.com',
  UNH: 'unitedhealthgroup.com',
  JNJ: 'jnj.com',
  XOM: 'exxonmobil.com',
  WMT: 'walmart.com',
  PG: 'pg.com',
  HD: 'homedepot.com',
  CVX: 'chevron.com',
  BAC: 'bankofamerica.com',
  ABBV: 'abbvie.com',
  KO: 'coca-cola.com',
  PFE: 'pfizer.com',
  MRK: 'merck.com',
  COST: 'costco.com',
  PEP: 'pepsico.com',
  TMO: 'thermofisher.com',
  AVGO: 'broadcom.com',
  CSCO: 'cisco.com',
  ACN: 'accenture.com',
  MCD: 'mcdonalds.com',
  ABT: 'abbott.com',
  DHR: 'danaher.com',
  NFLX: 'netflix.com',
  ADBE: 'adobe.com',
  CRM: 'salesforce.com',
  AMD: 'amd.com',
  INTC: 'intel.com',
  DIS: 'disney.com',
  PYPL: 'paypal.com',
  ORCL: 'oracle.com',
  IBM: 'ibm.com',
  WFC: 'wellsfargo.com',
  C: 'citigroup.com',
  GS: 'goldmansachs.com',
  MS: 'morganstanley.com',
};

// Try to guess domain from company name
function guessDomainFromName(name: string | undefined): string | null {
  if (!name) return null;

  // Clean up the name - remove common suffixes and special chars
  const cleaned = name
    .toLowerCase()
    .replace(/,?\s*(inc\.?|corp\.?|corporation|company|co\.?|ltd\.?|llc|plc|holdings?|group|&)$/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  if (cleaned.length < 2) return null;

  return `${cleaned}.com`;
}

export function CompanyLogo({ symbol, name, size = 'md', className = '' }: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const imageSizes = {
    sm: 32,
    md: 40,
    lg: 56,
  };

  // Get domain from mapping (check crypto first, then stocks, then guess from name)
  const upperSymbol = symbol.toUpperCase();
  const domain = cryptoToDomain[upperSymbol] || symbolToDomain[upperSymbol] || guessDomainFromName(name);

  // Use Uplead Logo API (better coverage than Clearbit)
  const logoUrl = domain ? `https://logo.uplead.com/${domain}` : null;

  if (hasError || !logoUrl) {
    // Fallback to full symbol or truncate if very long (most stock symbols are 1-5 chars)
    const displaySymbol = symbol.length <= 5 ? symbol : symbol.slice(0, 4);
    const fontSize = displaySymbol.length <= 2 ? 'text-sm' : displaySymbol.length <= 3 ? 'text-xs' : 'text-[10px]';
    return (
      <div
        className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center border border-[#adbbda] ${className}`}
      >
        <span className={`font-bold bg-gradient-to-r from-[#3d52a0] to-[#c9a227] bg-clip-text text-transparent ${fontSize}`}>
          {displaySymbol}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-white flex items-center justify-center border border-[#adbbda]/50 overflow-hidden ${className}`}
    >
      <Image
        src={logoUrl}
        alt={name || symbol}
        width={imageSizes[size]}
        height={imageSizes[size]}
        className="object-contain p-1"
        onError={() => setHasError(true)}
        unoptimized
      />
    </div>
  );
}
