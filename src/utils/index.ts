import { Rating } from '@/types';
import { UI_CONFIG } from '@/config/constants';

// ==================== Formatting Utilities ====================

/**
 * Format a number as currency
 */
export const formatCurrency = (value: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number as a percentage
 */
export const formatPercent = (value: number, decimals = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers (e.g., market cap)
 */
export const formatLargeNumber = (value: number): string => {
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  }
  return value.toString();
};

/**
 * Format volume with commas
 */
export const formatVolume = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Format a date string
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string => {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
};

/**
 * Format a datetime string
 */
export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

// ==================== Color Utilities ====================

/**
 * Get color for a rating
 */
export const getRatingColor = (rating: Rating): string => {
  return UI_CONFIG.COLORS[rating];
};

/**
 * Get color for price change
 */
export const getChangeColor = (change: number): string => {
  if (change > 0) return UI_CONFIG.COLORS.BUY;
  if (change < 0) return UI_CONFIG.COLORS.SELL;
  return UI_CONFIG.COLORS.SECONDARY;
};

// ==================== Validation Utilities ====================

/**
 * Validate a stock symbol
 */
export const isValidSymbol = (symbol: string): boolean => {
  return /^[A-Z]{1,5}$/.test(symbol.toUpperCase());
};

/**
 * Validate an email address
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ==================== Calculation Utilities ====================

/**
 * Calculate percentage change
 */
export const calculateChange = (
  current: number,
  previous: number
): { change: number; changePercent: number } => {
  const change = current - previous;
  const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
  return { change, changePercent };
};

/**
 * Calculate average
 */
export const calculateAverage = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
};

// ==================== Async Utilities ====================

/**
 * Sleep for a specified duration
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 1000
): Promise<T> => {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await sleep(baseDelayMs * Math.pow(2, i));
      }
    }
  }

  throw lastError;
};

// ==================== String Utilities ====================

/**
 * Truncate a string with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
