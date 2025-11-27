// ==================== Stock Types ====================

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  pe: number | null;
  high52w: number;
  low52w: number;
  open: number;
  previousClose: number;
  dayHigh: number;
  dayLow: number;
}

export interface PriceHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number | null;
  ma50: number | null;
  ma200: number | null;
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
}

export interface StockNews {
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface StockData {
  quote: StockQuote;
  priceHistory: PriceHistory[];
  technicalIndicators: TechnicalIndicators;
  news: StockNews[];
}

// ==================== Analysis Types ====================

export type Rating = 'BUY' | 'SELL' | 'HOLD';

export interface ModelResponse {
  modelId: string;
  modelName: string;
  rating: Rating;
  confidence: number; // 0-100
  reasoning: string;
  processingTimeMs?: number;
  error?: string;
}

export interface ConsensusResult {
  responses: ModelResponse[];
  consensus: Rating | null;
  avgConfidence: number;
  hasConsensus: boolean;
  modelsUsed: number;
  timestamp: string;
}

export interface AnalysisRequest {
  symbol: string;
  type: 'SCHEDULED' | 'ON_DEMAND';
  userId?: string;
}

export interface AnalysisResult {
  id: string;
  stockSymbol: string;
  stockName: string;
  consensusResult: ConsensusResult;
  priceAtAnalysis: number;
  createdAt: string;
}

// ==================== Alert Types ====================

export type AlertType = 'CONSENSUS_BUY' | 'CONSENSUS_SELL' | 'CONSENSUS_HOLD';

export interface Alert {
  id: string;
  userId: string;
  stockSymbol: string;
  alertType: AlertType;
  message: string;
  emailSent: boolean;
  emailSentAt?: string;
  createdAt: string;
}

// ==================== User Types ====================

export interface UserPreferences {
  emailAlerts: boolean;
  minConsensusModels: number;
  minConfidenceScore: number;
  alertFrequency: 'IMMEDIATE' | 'DAILY_DIGEST';
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: string;
  lastAnalysis?: AnalysisResult;
}

// ==================== API Response Types ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
