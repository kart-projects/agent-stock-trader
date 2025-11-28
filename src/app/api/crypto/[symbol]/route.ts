import { NextResponse } from 'next/server';

// Improved cache with error tracking
interface CacheEntry {
  price: number;
  change24h: number;
  timestamp: number;
  error?: string;
}

const priceCache: Record<string, CacheEntry> = {};
const CACHE_DURATION = 30000; // 30 seconds cache (increased for rate limit safety)
const ERROR_CACHE_DURATION = 120000; // 2 minutes for errors

// Map Yahoo Finance crypto symbols to CoinGecko IDs
const yahooToCoinGecko: Record<string, string> = {
  'BTC-USD': 'bitcoin',
  'ETH-USD': 'ethereum',
  'BNB-USD': 'binancecoin',
  'XRP-USD': 'ripple',
  'ADA-USD': 'cardano',
  'DOGE-USD': 'dogecoin',
  'SOL-USD': 'solana',
  'DOT-USD': 'polkadot',
  'MATIC-USD': 'matic-network',
  'LTC-USD': 'litecoin',
  'AVAX-USD': 'avalanche-2',
  'LINK-USD': 'chainlink',
  'UNI-USD': 'uniswap',
  'ATOM-USD': 'cosmos',
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const coinGeckoId = yahooToCoinGecko[symbol.toUpperCase()];

  if (!coinGeckoId) {
    return NextResponse.json(
      { success: false, error: 'Symbol not supported for real-time crypto data' },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const cached = priceCache[coinGeckoId];
    const now = Date.now();
    
    if (cached) {
      const isErrorEntry = cached.error !== undefined;
      const cacheDuration = isErrorEntry ? ERROR_CACHE_DURATION : CACHE_DURATION;
      
      if (now - cached.timestamp < cacheDuration) {
        if (isErrorEntry) {
          // Return cached error
          console.log(`[Cache] Returning cached error for ${coinGeckoId}:`, cached.error);
          return NextResponse.json(
            { success: false, error: cached.error, fromCache: true },
            { status: 429 } // Rate limit status
          );
        }
        // Return cached successful response
        console.log(`[Cache] Returning cached data for ${coinGeckoId}`);
        return NextResponse.json({
          success: true,
          data: {
            symbol: symbol.toUpperCase(),
            price: cached.price,
            change24h: cached.change24h,
            timestamp: cached.timestamp,
            fromCache: true,
          },
        });
      }
    }

    // Fetch from CoinGecko public API (free, no auth required, works globally)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd&include_24hr_change=true`,
      {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'StockAI Pro/1.0',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      const errorMsg = response.status === 429 
        ? 'CoinGecko rate limit exceeded. Using cached data.'
        : `CoinGecko API returned ${response.status}`;
      
      console.error('CoinGecko response error:', response.status, errorText);
      
      // Cache the error response
      priceCache[coinGeckoId] = {
        price: 0,
        change24h: 0,
        timestamp: now,
        error: errorMsg,
      };
      
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: response.status === 429 ? 429 : 500 }
      );
    }

    const data = await response.json();
    const coinData = data[coinGeckoId];

    if (!coinData) {
      throw new Error('No data returned for symbol');
    }

    // Cache successful response
    priceCache[coinGeckoId] = {
      price: coinData.usd,
      change24h: coinData.usd_24h_change || 0,
      timestamp: now,
    };

    return NextResponse.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        price: coinData.usd,
        change24h: coinData.usd_24h_change || 0,
        timestamp: now,
      },
    });
  } catch (error) {
    console.error('CoinGecko API error:', error);
    
    // Check if we have any cached data to return as fallback
    const cached = priceCache[coinGeckoId];
    if (cached && !cached.error) {
      console.log(`[Fallback] Using cached data for ${coinGeckoId} due to error`);
      return NextResponse.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          price: cached.price,
          change24h: cached.change24h,
          timestamp: cached.timestamp,
          fromCache: true,
          fallback: true,
        },
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch crypto price. Please try again later.' },
      { status: 500 }
    );
  }
}
