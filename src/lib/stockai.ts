import { StockAIClient } from 'stockai-sdk';

// SDK client for server-side API routes
// Uses environment variable for API URL, defaults to localhost for development
export const stockai = new StockAIClient({
  baseUrl: process.env.STOCKAI_API_URL || 'http://localhost:3001',
  apiKey: process.env.STOCKAI_API_KEY || '',
});
