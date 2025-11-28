import { getEnabledModels } from '@/config/models';
import { queryModel, isProviderAvailable } from './modelProviders';
import type { StockData, ModelResponse, ConsensusResult, Rating } from '@/types';

/**
 * Build the analysis prompt for AI models
 */
export function buildAnalysisPrompt(stockData: StockData): string {
  const { quote, priceHistory, technicalIndicators, news } = stockData;

  // Get recent price history (last 10 days)
  const recentPrices = priceHistory.slice(-10);
  const priceHistoryStr = recentPrices
    .map((p) => `${p.date}: $${p.close.toFixed(2)}`)
    .join('\n');

  // Format news headlines
  const newsStr =
    news.length > 0
      ? news.map((n) => `- ${n.headline}`).join('\n')
      : '- No recent news available';

  // Calculate price position in 52-week range
  const pricePosition = ((quote.price - quote.low52w) / (quote.high52w - quote.low52w) * 100).toFixed(1);

  // Calculate price vs moving averages
  const priceVsMa50 = technicalIndicators.ma50
    ? ((quote.price - technicalIndicators.ma50) / technicalIndicators.ma50 * 100).toFixed(2)
    : null;
  const priceVsMa200 = technicalIndicators.ma200
    ? ((quote.price - technicalIndicators.ma200) / technicalIndicators.ma200 * 100).toFixed(2)
    : null;

  return `You are an aggressive stock trader looking for opportunities. Analyze this stock and make a DECISIVE recommendation. Avoid defaulting to HOLD - take a position based on the data.

**Stock:** ${quote.symbol} (${quote.name})
**Current Price:** $${quote.price.toFixed(2)}
**Day Change:** ${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)
**52-Week Range:** $${quote.low52w.toFixed(2)} - $${quote.high52w.toFixed(2)} (Currently at ${pricePosition}% of range)
**P/E Ratio:** ${quote.pe ? quote.pe.toFixed(2) : 'N/A'}
**Market Cap:** $${formatMarketCap(quote.marketCap)}
**Volume:** ${quote.volume.toLocaleString()} (Avg: ${quote.avgVolume.toLocaleString()})

**Recent Price Action (Last 10 Days):**
${priceHistoryStr}

**Technical Indicators:**
- RSI (14): ${technicalIndicators.rsi?.toFixed(2) || 'N/A'}${technicalIndicators.rsi ? (technicalIndicators.rsi > 70 ? ' (OVERBOUGHT)' : technicalIndicators.rsi < 30 ? ' (OVERSOLD)' : '') : ''}
- 50-day MA: ${technicalIndicators.ma50 ? '$' + technicalIndicators.ma50.toFixed(2) : 'N/A'}${priceVsMa50 ? ` (Price is ${Number(priceVsMa50) >= 0 ? '+' : ''}${priceVsMa50}% vs MA50)` : ''}
- 200-day MA: ${technicalIndicators.ma200 ? '$' + technicalIndicators.ma200.toFixed(2) : 'N/A'}${priceVsMa200 ? ` (Price is ${Number(priceVsMa200) >= 0 ? '+' : ''}${priceVsMa200}% vs MA200)` : ''}
- MACD: ${technicalIndicators.macd?.toFixed(4) || 'N/A'}${technicalIndicators.macd ? (technicalIndicators.macd > 0 ? ' (BULLISH)' : ' (BEARISH)') : ''}

**Recent News Headlines:**
${newsStr}

DECISION GUIDELINES:
- BUY if: RSI < 40, price near 52-week low, price below moving averages, positive momentum signals
- SELL if: RSI > 60, price near 52-week high, price well above moving averages, negative news
- Only HOLD if signals are truly mixed with no clear direction

Respond with ONLY a valid JSON object (no markdown):
{
  "rating": "BUY" or "SELL" or "HOLD",
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentences with specific data points supporting your decision>"
}`;
}

/**
 * Parse AI model response to extract rating, confidence, and reasoning
 */
function parseModelResponse(content: string): {
  rating: Rating;
  confidence: number;
  reasoning: string;
} {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate rating
    const rating = parsed.rating?.toUpperCase();
    if (!['BUY', 'SELL', 'HOLD'].includes(rating)) {
      throw new Error(`Invalid rating: ${rating}`);
    }

    // Validate confidence
    const confidence = Number(parsed.confidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 100) {
      throw new Error(`Invalid confidence: ${parsed.confidence}`);
    }

    return {
      rating: rating as Rating,
      confidence,
      reasoning: parsed.reasoning || 'No reasoning provided',
    };
  } catch {
    // If parsing fails, try to extract rating from text
    const upperContent = content.toUpperCase();

    let rating: Rating = 'HOLD';
    if (upperContent.includes('BUY') && !upperContent.includes('SELL')) {
      rating = 'BUY';
    } else if (upperContent.includes('SELL') && !upperContent.includes('BUY')) {
      rating = 'SELL';
    }

    return {
      rating,
      confidence: 50, // Default confidence when parsing fails
      reasoning: `Unable to parse structured response. Raw analysis: ${content.slice(0, 200)}...`,
    };
  }
}

/**
 * Analyze a stock using all enabled AI models
 */
export async function analyzeWithAllModels(
  stockData: StockData
): Promise<ConsensusResult> {
  const prompt = buildAnalysisPrompt(stockData);
  const enabledModels = getEnabledModels();

  console.log('[Analysis] Enabled models:', enabledModels.map(m => m.id));

  // Filter to only models with available providers
  const availableModels = enabledModels.filter((m) =>
    isProviderAvailable(m.provider)
  );

  console.log('[Analysis] Available models (with API keys):', availableModels.map(m => `${m.id} (${m.provider})`));

  if (availableModels.length < 1) {
    throw new Error(
      'No AI models available. Please configure at least one API key (GOOGLE_AI_API_KEY or GROQ_API_KEY).'
    );
  }

  // Query all available models in parallel
  const results = await Promise.allSettled(
    availableModels.map(async (config) => {
      const result = await queryModel(config, prompt);
      const parsed = parseModelResponse(result.content);

      return {
        modelId: config.id,
        modelName: config.name,
        rating: parsed.rating,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        processingTimeMs: result.processingTimeMs,
      } as ModelResponse;
    })
  );

  // Separate successful and failed responses
  const responses: ModelResponse[] = [];
  const errors: Array<{ modelId: string; error: string }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`[Analysis] ${availableModels[index].id} response:`, result.value.rating, result.value.confidence + '%');
      responses.push(result.value);
    } else {
      console.error(`[Analysis] ${availableModels[index].id} FAILED:`, result.reason?.message);
      errors.push({
        modelId: availableModels[index].id,
        error: result.reason?.message || 'Unknown error',
      });
    }
  });

  console.log(`[Analysis] Successful: ${responses.length}, Failed: ${errors.length}`);

  // Calculate consensus
  const { consensus, avgConfidence, hasConsensus } =
    calculateConsensus(responses);

  return {
    responses,
    consensus,
    avgConfidence,
    hasConsensus,
    modelsUsed: responses.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate consensus from model responses
 */
function calculateConsensus(responses: ModelResponse[]): {
  consensus: Rating | null;
  avgConfidence: number;
  hasConsensus: boolean;
} {
  if (responses.length === 0) {
    return { consensus: null, avgConfidence: 0, hasConsensus: false };
  }

  // Count ratings
  const ratings = responses.map((r) => r.rating);
  const buyCount = ratings.filter((r) => r === 'BUY').length;
  const sellCount = ratings.filter((r) => r === 'SELL').length;
  const holdCount = ratings.filter((r) => r === 'HOLD').length;
  const total = responses.length;

  // Calculate average confidence
  const avgConfidence =
    responses.reduce((sum, r) => sum + r.confidence, 0) / total;

  // Consensus requires ALL models to agree
  let consensus: Rating | null = null;
  let hasConsensus = false;

  if (buyCount === total) {
    consensus = 'BUY';
    hasConsensus = true;
  } else if (sellCount === total) {
    consensus = 'SELL';
    hasConsensus = true;
  } else if (holdCount === total) {
    consensus = 'HOLD';
    hasConsensus = true;
  } else {
    // No full consensus - return majority if exists
    if (buyCount > sellCount && buyCount > holdCount) {
      consensus = 'BUY';
    } else if (sellCount > buyCount && sellCount > holdCount) {
      consensus = 'SELL';
    } else {
      consensus = 'HOLD';
    }
    hasConsensus = false;
  }

  return { consensus, avgConfidence, hasConsensus };
}

/**
 * Format market cap for display
 */
function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  return value.toLocaleString();
}
