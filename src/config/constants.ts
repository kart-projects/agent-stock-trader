// ==================== App Configuration ====================

export const APP_NAME = 'AI Stock Trader';
export const APP_DESCRIPTION = 'Multi-model AI consensus stock analysis';

// ==================== Analysis Configuration ====================

export const ANALYSIS_CONFIG = {
  // Minimum number of models that must agree for consensus
  MIN_CONSENSUS_MODELS: 2,

  // Default confidence threshold (0-100)
  DEFAULT_MIN_CONFIDENCE: 70,

  // Maximum age of cached analysis data (in minutes)
  ANALYSIS_CACHE_TTL: 60,

  // Rate limiting
  MAX_ANALYSIS_PER_HOUR: 100,
  MAX_ANALYSIS_PER_DAY: 1000,
} as const;

// ==================== Stock Data Configuration ====================

export const STOCK_CONFIG = {
  // Time periods for historical data
  TIME_PERIODS: ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'] as const,

  // Default number of days for price history
  DEFAULT_HISTORY_DAYS: 30,

  // Maximum stocks in watchlist
  MAX_WATCHLIST_SIZE: 50,

  // Market hours (Eastern Time)
  MARKET_OPEN_HOUR: 9,
  MARKET_OPEN_MINUTE: 30,
  MARKET_CLOSE_HOUR: 16,
  MARKET_CLOSE_MINUTE: 0,
} as const;

// ==================== Alert Configuration ====================

export const ALERT_CONFIG = {
  // Types of alerts
  ALERT_TYPES: ['CONSENSUS_BUY', 'CONSENSUS_SELL', 'CONSENSUS_HOLD'] as const,

  // Alert frequency options
  FREQUENCIES: ['IMMEDIATE', 'DAILY_DIGEST'] as const,

  // Maximum alerts per day per user
  MAX_ALERTS_PER_DAY: 50,
} as const;

// ==================== UI Configuration ====================

export const UI_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Chart colors
  COLORS: {
    BUY: '#22c55e', // green-500
    SELL: '#ef4444', // red-500
    HOLD: '#f59e0b', // amber-500
    PRIMARY: '#3b82f6', // blue-500
    SECONDARY: '#6b7280', // gray-500
  },

  // Toast duration (ms)
  TOAST_DURATION: 5000,
} as const;

// ==================== API Endpoints ====================

export const API_ROUTES = {
  // Stock routes
  STOCKS: '/api/stocks',
  STOCK_QUOTE: (symbol: string) => `/api/stocks/${symbol}`,
  STOCK_HISTORY: (symbol: string) => `/api/stocks/${symbol}/history`,

  // Analysis routes
  ANALYSIS: '/api/analysis',
  ANALYSIS_BY_ID: (id: string) => `/api/analysis/${id}`,
  ANALYZE_STOCK: (symbol: string) => `/api/analysis/stock/${symbol}`,

  // User routes
  WATCHLIST: '/api/user/watchlist',
  PREFERENCES: '/api/user/preferences',
  ALERTS: '/api/user/alerts',

  // Auth routes
  AUTH: {
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    SESSION: '/api/auth/session',
  },
} as const;

// ==================== External API Configuration ====================

export const EXTERNAL_APIS = {
  // Yahoo Finance (free, no key needed)
  YAHOO_FINANCE: {
    BASE_URL: 'https://query1.finance.yahoo.com/v8/finance',
  },

  // Alpha Vantage (free tier: 25 requests/day)
  ALPHA_VANTAGE: {
    BASE_URL: 'https://www.alphavantage.co/query',
  },
} as const;
