import YahooFinance from 'yahoo-finance2';
import type { StockQuote, PriceHistory, TechnicalIndicators, StockNews, StockData } from '@/types';

// Instantiate Yahoo Finance client (required in v3)
const yahooFinance = new YahooFinance();

// Type for Yahoo Finance quote response
interface YahooQuote {
  symbol: string;
  shortName?: string;
  longName?: string;
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketVolume?: number;
  averageDailyVolume10Day?: number;
  marketCap?: number;
  trailingPE?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  regularMarketOpen?: number;
  regularMarketPreviousClose?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
}

/**
 * Fetch real-time stock quote from Yahoo Finance
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const quote = await yahooFinance.quote(symbol) as YahooQuote;

  return {
    symbol: quote.symbol || symbol,
    name: quote.shortName || quote.longName || symbol,
    price: quote.regularMarketPrice || 0,
    change: quote.regularMarketChange || 0,
    changePercent: quote.regularMarketChangePercent || 0,
    volume: quote.regularMarketVolume || 0,
    avgVolume: quote.averageDailyVolume10Day || 0,
    marketCap: quote.marketCap || 0,
    pe: quote.trailingPE || null,
    high52w: quote.fiftyTwoWeekHigh || 0,
    low52w: quote.fiftyTwoWeekLow || 0,
    open: quote.regularMarketOpen || 0,
    previousClose: quote.regularMarketPreviousClose || 0,
    dayHigh: quote.regularMarketDayHigh || 0,
    dayLow: quote.regularMarketDayLow || 0,
  };
}

// Type for Yahoo Finance chart quote
interface YahooChartQuote {
  date: Date;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
}

// Type for Yahoo Finance chart result
interface YahooChartResult {
  quotes: YahooChartQuote[];
}

/**
 * Fetch historical price data
 */
export async function getPriceHistory(
  symbol: string,
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' = '1mo'
): Promise<PriceHistory[]> {
  const result = await yahooFinance.chart(symbol, {
    period1: getStartDate(period),
    interval: getInterval(period),
  }) as YahooChartResult;

  return result.quotes.map((quote) => ({
    date: new Date(quote.date).toISOString().split('T')[0],
    open: quote.open || 0,
    high: quote.high || 0,
    low: quote.low || 0,
    close: quote.close || 0,
    volume: quote.volume || 0,
  }));
}

/**
 * Calculate technical indicators from price history
 */
export function calculateTechnicalIndicators(
  priceHistory: PriceHistory[]
): TechnicalIndicators {
  if (priceHistory.length < 14) {
    return {
      rsi: null,
      ma50: null,
      ma200: null,
      macd: null,
      macdSignal: null,
      macdHistogram: null,
    };
  }

  const closes = priceHistory.map((p) => p.close);

  return {
    rsi: calculateRSI(closes, 14),
    ma50: calculateSMA(closes, Math.min(50, closes.length)),
    ma200: closes.length >= 200 ? calculateSMA(closes, 200) : null,
    macd: calculateMACD(closes).macd,
    macdSignal: calculateMACD(closes).signal,
    macdHistogram: calculateMACD(closes).histogram,
  };
}

// Type for Yahoo Finance news item
interface YahooNewsItem {
  title: string;
  publisher?: string;
  link: string;
  providerPublishTime?: number | Date;
}

// Type for Yahoo Finance search quote
interface YahooSearchQuote {
  symbol: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
}

// Type for Yahoo Finance search result
interface YahooSearchResult {
  news?: YahooNewsItem[];
  quotes?: YahooSearchQuote[];
}

/**
 * Fetch stock news/headlines (using Yahoo Finance search)
 */
export async function getStockNews(symbol: string): Promise<StockNews[]> {
  try {
    const result = await yahooFinance.search(symbol, { newsCount: 5 }) as YahooSearchResult;
    const news = (result.news || []) as YahooNewsItem[];

    return news.map((item) => ({
      headline: item.title,
      summary: item.title, // Yahoo doesn't provide summary in search
      source: item.publisher || 'Unknown',
      url: item.link,
      publishedAt: parseNewsDate(item.providerPublishTime),
    }));
  } catch {
    // News fetch can fail, return empty array
    return [];
  }
}

/**
 * Get complete stock data including quote, history, indicators, and news
 */
export async function getStockData(
  symbol: string,
  historyPeriod: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' = '3mo'
): Promise<StockData> {
  // Always fetch 1 year of data for technical indicators (200-day MA needs 200+ data points)
  const indicatorPeriod = '1y';

  const [quote, priceHistory, indicatorHistory, news] = await Promise.all([
    getStockQuote(symbol),
    getPriceHistory(symbol, historyPeriod),
    getPriceHistory(symbol, indicatorPeriod),
    getStockNews(symbol),
  ]);

  // Use the longer history for calculating technical indicators
  const technicalIndicators = calculateTechnicalIndicators(indicatorHistory);

  return {
    quote,
    priceHistory,
    technicalIndicators,
    news,
  };
}

/**
 * Search for stocks and cryptocurrencies by query
 */
export async function searchStocks(
  query: string
): Promise<Array<{ symbol: string; name: string; type: string }>> {
  try {
    const result = await yahooFinance.search(query) as YahooSearchResult;
    const quotes = (result.quotes || []) as YahooSearchQuote[];

    console.log(`[Search] Query: "${query}", Results: ${quotes.length}`);

    // Include stocks, ETFs, and cryptocurrencies
    const allowedTypes = ['EQUITY', 'ETF', 'CRYPTOCURRENCY'];

    const filtered = quotes
      .filter((q) => q.quoteType && allowedTypes.includes(q.quoteType))
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: q.quoteType || 'EQUITY',
      }));

    console.log(`[Search] Filtered results: ${filtered.length}`);
    return filtered;
  } catch (error) {
    console.error('[Search] Error:', error);
    throw error;
  }
}

// ==================== Helper Functions ====================

/**
 * Parse news date from Yahoo Finance - handles both Date objects and timestamps
 */
function parseNewsDate(publishTime: number | Date | undefined): string {
  if (!publishTime) {
    return new Date().toISOString();
  }

  // If it's already a Date object
  if (publishTime instanceof Date) {
    return publishTime.toISOString();
  }

  // If it's a number, determine if it's seconds or milliseconds
  // Unix timestamps in seconds are ~10 digits (before year 2286)
  // Timestamps in milliseconds are ~13 digits
  const timestamp = publishTime > 10000000000
    ? publishTime  // Already in milliseconds
    : publishTime * 1000;  // Convert seconds to milliseconds

  return new Date(timestamp).toISOString();
}

function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case '1d':
      // For 1D period, get last 5 days of daily data to show movement
      return new Date(now.setDate(now.getDate() - 5));
    case '5d':
      return new Date(now.setDate(now.getDate() - 5));
    case '1mo':
      return new Date(now.setMonth(now.getMonth() - 1));
    case '3mo':
      return new Date(now.setMonth(now.getMonth() - 3));
    case '6mo':
      return new Date(now.setMonth(now.getMonth() - 6));
    case '1y':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case '5y':
      return new Date(now.setFullYear(now.getFullYear() - 5));
    default:
      return new Date(now.setMonth(now.getMonth() - 1));
  }
}

function getInterval(period: string): '1d' | '1h' | '5m' {
  switch (period) {
    case '1d':
      // Use daily interval for 1D - more reliable than 5m intraday
      // This shows the last trading day's OHLC data
      return '1d';
    case '5d':
      return '1h';
    default:
      return '1d';
  }
}

function calculateSMA(data: number[], period: number): number {
  if (data.length < period) return data[data.length - 1];
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
}

function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA for first EMA value
  let sum = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sum += data[i];
  }
  ema.push(sum / Math.min(period, data.length));

  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    ema.push((data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }

  return ema;
}

function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50; // Neutral if not enough data

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate smoothed RSI
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calculateMACD(closes: number[]): {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
} {
  if (closes.length < 26) {
    return { macd: null, signal: null, histogram: null };
  }

  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);

  // MACD line = EMA12 - EMA26
  const macdLine: number[] = [];
  const startIndex = Math.max(0, ema26.length - ema12.length);

  for (let i = 0; i < ema26.length; i++) {
    const ema12Index = i - startIndex;
    if (ema12Index >= 0 && ema12Index < ema12.length) {
      macdLine.push(ema12[ema12Index] - ema26[i]);
    }
  }

  if (macdLine.length < 9) {
    return { macd: macdLine[macdLine.length - 1] || null, signal: null, histogram: null };
  }

  // Signal line = 9-period EMA of MACD line
  const signalLine = calculateEMA(macdLine, 9);

  const macd = macdLine[macdLine.length - 1];
  const signal = signalLine[signalLine.length - 1];
  const histogram = macd - signal;

  return { macd, signal, histogram };
}
