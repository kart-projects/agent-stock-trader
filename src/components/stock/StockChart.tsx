'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { PriceHistory } from '@/types';

interface StockChartProps {
  symbol: string;
  initialData: PriceHistory[];
}

type Period = 'live' | '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y';

const periodLabels: Record<Period, string> = {
  'live': 'LIVE',
  '1d': '1D',
  '5d': '5D',
  '1mo': '1M',
  '3mo': '3M',
  '6mo': '6M',
  '1y': '1Y',
};

interface LiveDataPoint {
  time: string;
  price: number;
  displayTime: string;
}

// Crypto symbols that support real-time Binance data
const cryptoSymbols = new Set([
  'BTC-USD', 'ETH-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD',
  'DOGE-USD', 'SOL-USD', 'DOT-USD', 'MATIC-USD', 'LTC-USD',
  'AVAX-USD', 'LINK-USD', 'UNI-USD', 'ATOM-USD'
]);

export function StockChart({ symbol, initialData }: StockChartProps) {
  const [period, setPeriod] = useState<Period>('1y');
  const [data, setData] = useState<PriceHistory[]>(initialData);
  const [liveData, setLiveData] = useState<LiveDataPoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const startPriceRef = useRef<number | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const consecutiveErrorsRef = useRef(0);

  // Check if this is a crypto symbol
  const isCrypto = cryptoSymbols.has(symbol.toUpperCase());


  // Initialize live mode when switching to it
  useEffect(() => {
    if (period === 'live') {
      setLiveData([]);
      startPriceRef.current = null;
    }
  }, [period]);

  // Handle live mode polling
  useEffect(() => {
    if (period !== 'live') {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      setIsConnected(false);
      setRateLimited(false);
      return;
    }

    // Define fetch function inline to avoid dependency issues
    const fetchPrice = async () => {
      try {
        const endpoint = isCrypto ? `/api/crypto/${symbol}` : `/api/stocks/${symbol}?period=1d`;
        const res = await fetch(endpoint);
        const result = await res.json();

        // Check for rate limit errors
        if (res.status === 429 || result.error?.includes('rate limit')) {
          console.warn('Rate limit detected, backing off...');
          setRateLimited(true);
          consecutiveErrorsRef.current++;
          return;
        }

        let price: number | null = null;
        if (isCrypto && result.success) {
          price = result.data.price;
        } else if (!isCrypto && result.success && result.data.quote) {
          price = result.data.quote.price;
        }

        if (price !== null) {
          const time = new Date();

          if (startPriceRef.current === null) {
            startPriceRef.current = price;
          }

          setCurrentPrice(price);
          setLastUpdated(time);
          setIsConnected(true);
          setRateLimited(false);
          consecutiveErrorsRef.current = 0; // Reset error counter on success

          setLiveData(prev => {
            const newPoint: LiveDataPoint = {
              time: time.toISOString(),
              price,
              displayTime: time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit'
              }),
            };

            const updated = [...prev, newPoint];
            if (updated.length > 100) {
              return updated.slice(-100);
            }
            return updated;
          });
        }
      } catch (error) {
        console.error('Failed to fetch price:', error);
        setIsConnected(false);
        consecutiveErrorsRef.current++;
      }
    };

    // Initial fetch
    fetchPrice();

    // Set up polling interval with exponential backoff for errors
    // Start at 5 seconds for crypto (reduced from 3s), increase interval if rate limited
    const baseInterval = isCrypto ? 5000 : 3000;
    const interval = rateLimited 
      ? Math.min(baseInterval * Math.pow(2, Math.min(consecutiveErrorsRef.current, 3)), 60000) // Max 60 seconds
      : baseInterval;
    
    pollingRef.current = setInterval(fetchPrice, interval);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [period, isCrypto, symbol, rateLimited]);

  // Fetch data for historical periods
  const refreshData = useCallback(async (targetPeriod: Period, showLoading = false) => {
    if (targetPeriod === 'live') return;

    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch(`/api/stocks/${symbol}?period=${targetPeriod}`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const result = await res.json();
      if (result.success) {
        setData(result.data.priceHistory);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch chart data');
      }
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [symbol]);

  // Handle period change
  const handlePeriodChange = async (newPeriod: Period) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    if (newPeriod !== 'live') {
      await refreshData(newPeriod, true);
    }
  };

  // Auto-refresh for non-live periods
  useEffect(() => {
    if (period === 'live') return;

    const interval = setInterval(() => {
      refreshData(period, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [period, refreshData]);

  // Calculate price change based on period
  let firstPrice: number;
  let lastPrice: number;
  let chartData: Array<{ date?: string; time?: string; price: number; displayDate?: string; displayTime?: string }>;
  let minPrice: number;
  let maxPrice: number;

  if (period === 'live') {
    firstPrice = startPriceRef.current || liveData[0]?.price || 0;
    lastPrice = currentPrice || liveData[liveData.length - 1]?.price || 0;
    chartData = liveData.map(item => ({
      time: item.time,
      price: item.price,
      displayTime: item.displayTime,
    }));
    const prices = liveData.map(d => d.price);
    minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  } else {
    firstPrice = data[0]?.close || 0;
    lastPrice = data[data.length - 1]?.close || 0;
    chartData = data.map((item) => ({
      date: item.date,
      price: item.close,
      displayDate: formatDate(item.date, period),
    }));
    const prices = data.map((d) => d.close);
    minPrice = Math.min(...prices);
    maxPrice = Math.max(...prices);
  }

  const priceChange = lastPrice - firstPrice;
  const percentChange = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Dynamic scaling for live mode - ensure minimum visible range
  // For high-value assets like BTC, use percentage-based padding
  const priceRange = maxPrice - minPrice;
  const avgPrice = (maxPrice + minPrice) / 2 || 1;

  let padding: number;
  if (period === 'live') {
    // For live mode, use ultra-tight scaling to show even the smallest changes
    // Use 0.01% minimum visible range (10x more sensitive than before)
    const minPercentRange = avgPrice * 0.0001; // 0.01% minimum visible range
    const actualRange = Math.max(priceRange, minPercentRange);
    padding = actualRange * 0.1; // 10% padding (very tight)
  } else {
    padding = priceRange * 0.1 || 1;
  }

  // Recalculate domain for live mode with better scaling
  let domainMin = minPrice - padding;
  let domainMax = maxPrice + padding;

  if (period === 'live' && priceRange < avgPrice * 0.0001) {
    // If range is less than 0.01%, center around average with ultra-tight spread
    const minSpread = avgPrice * 0.00015; // 0.015% total spread (very tight)
    domainMin = avgPrice - minSpread;
    domainMax = avgPrice + minSpread;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#adbbda]/50 overflow-hidden shadow-sm shadow-[#8697c4]/10">
      <div className="px-6 py-4 border-b border-[#adbbda]/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1e2a4a] flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ede8f5] to-[#adbbda] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3d52a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            Price Chart
            {period === 'live' && currentPrice && (
              <span className="ml-2 text-2xl font-bold text-[#1e2a4a]">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            )}
          </h2>

          {/* Period selector */}
          <div className="flex items-center gap-1 bg-[#ede8f5] rounded-lg p-1">
            {(Object.keys(periodLabels) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                disabled={isLoading}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  period === p
                    ? p === 'live'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm'
                      : 'bg-white text-[#3d52a0] shadow-sm'
                    : 'text-[#3d52a0]/60 hover:text-[#3d52a0]'
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Price change indicator */}
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}
          </span>
          <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
            isPositive
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
          </span>
          <span className="text-sm text-[#1e2a4a]/50">
            {period === 'live' ? 'Session' : periodLabels[period]} change
          </span>
          <span className="ml-auto text-xs text-[#1e2a4a]/40 flex items-center gap-1">
            {period === 'live' ? (
              <>
                <span className={`w-2 h-2 rounded-full ${
                  rateLimited ? 'bg-amber-500' : (isConnected ? 'bg-emerald-500' : 'bg-red-500')
                } animate-pulse`}></span>
                {rateLimited ? 'Rate limited' : (isConnected ? 'Live' : 'Connecting...')} · {lastUpdated.toLocaleTimeString()}
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Updated {lastUpdated.toLocaleTimeString()}
              </>
            )}
          </span>
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-4 border-[#adbbda]"></div>
                <div className="absolute inset-0 w-10 h-10 rounded-full border-4 border-transparent border-t-[#3d52a0] animate-spin"></div>
              </div>
              <span className="text-sm text-[#1e2a4a]/60">Loading chart...</span>
            </div>
          </div>
        ) : period === 'live' && liveData.length < 2 ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-200"></div>
                <div className="absolute inset-0 w-10 h-10 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"></div>
              </div>
              <span className="text-sm text-[#1e2a4a]/60">Starting live feed...</span>
              <span className="text-xs text-[#1e2a4a]/40">Fetching real-time prices</span>
            </div>
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={`colorPrice-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? '#10b981' : '#ef4444'}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? '#10b981' : '#ef4444'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey={period === 'live' ? 'displayTime' : 'displayDate'}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8697c4', fontSize: 12 }}
                  tickMargin={10}
                  interval="preserveStartEnd"
                  minTickGap={50}
                />
                <YAxis
                  domain={[domainMin, domainMax]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#8697c4', fontSize: 12 }}
                  tickFormatter={(value) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  width={90}
                />
                {period === 'live' && startPriceRef.current && (
                  <ReferenceLine
                    y={startPriceRef.current}
                    stroke="#8697c4"
                    strokeDasharray="3 3"
                    strokeOpacity={0.5}
                  />
                )}
                <Tooltip content={<CustomTooltip isLive={period === 'live'} />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill={`url(#colorPrice-${symbol})`}
                  isAnimationActive={period !== 'live'}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  isLive,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  isLive?: boolean;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-[#adbbda] rounded-xl p-3 shadow-lg">
        <p className="text-xs text-[#1e2a4a]/60 mb-1">{label}</p>
        <p className="text-lg font-bold text-[#1e2a4a]">
          ${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {isLive && (
          <p className="text-xs text-emerald-600 mt-1">Real-time</p>
        )}
      </div>
    );
  }
  return null;
}

function formatDate(dateStr: string, period: Period): string {
  const date = new Date(dateStr);

  if (period === '1d') {
    // 1D now shows daily data over 5 days, so use date format
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (period === '5d') {
    return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric' });
  }

  if (period === '1mo') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
