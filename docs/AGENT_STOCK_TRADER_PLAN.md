# Multi-Model Stock Trading Analysis App

## Project Overview

A stock trading analysis application that leverages multiple AI models (Claude, GPT-4, Gemini) to analyze stocks and provide consensus-based buy/sell recommendations via email alerts.

---

## Core Concept

**The "AI Consensus" Approach:**
- Query 3+ AI models with the same stock data and analysis prompt
- Each model provides a recommendation (Buy/Sell/Hold) with confidence score
- When models reach consensus (e.g., all 3 say "Buy"), trigger an email alert
- Users get notified only on high-confidence, multi-model agreement

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Charts:** Recharts or TradingView widget
- **State:** React Query for server state

### Backend
- **Runtime:** Next.js API Routes / Route Handlers
- **Database:** PostgreSQL (via Supabase or AWS RDS)
- **ORM:** Prisma
- **Job Queue:** AWS SQS or Bull (Redis-based)

### AI Models (Free Tier)
- **Google Gemini 1.5 Flash** (gemini-1.5-flash) — 15 req/min, 1M tokens/day free
- **Groq Llama 3.1 70B** (llama-3.1-70b-versatile) — 30 req/min free
- **Groq Mixtral 8x7B** (mixtral-8x7b-32768) — 30 req/min free

### Flexible Model Architecture

The app uses a **provider-agnostic design** so you can easily swap between free and paid models:

```typescript
// config/models.ts

export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'groq';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  model: string;
  enabled: boolean;
  costPerMillionTokens: { input: number; output: number };
}

// Define all available models - enable/disable as needed
export const AVAILABLE_MODELS: ModelConfig[] = [
  // === FREE TIER (Default) ===
  {
    id: 'gemini-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    model: 'gemini-1.5-flash',
    enabled: true,  // ✅ Active
    costPerMillionTokens: { input: 0, output: 0 },
  },
  {
    id: 'groq-llama',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    enabled: true,  // ✅ Active
    costPerMillionTokens: { input: 0, output: 0 },
  },
  {
    id: 'groq-mixtral',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    model: 'mixtral-8x7b-32768',
    enabled: true,  // ✅ Active
    costPerMillionTokens: { input: 0, output: 0 },
  },

  // === PAID TIER (Enable when ready) ===
  {
    id: 'claude-opus',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    model: 'claude-opus-4-5-20251101',
    enabled: false,  // ❌ Disabled (paid)
    costPerMillionTokens: { input: 15, output: 75 },
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    enabled: false,  // ❌ Disabled (paid)
    costPerMillionTokens: { input: 3, output: 15 },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    model: 'gpt-4-turbo',
    enabled: false,  // ❌ Disabled (paid)
    costPerMillionTokens: { input: 10, output: 30 },
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    enabled: false,  // ❌ Disabled (paid)
    costPerMillionTokens: { input: 5, output: 15 },
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    model: 'gemini-1.5-pro',
    enabled: false,  // ❌ Disabled (paid)
    costPerMillionTokens: { input: 3.5, output: 10.5 },
  },
];

// Get only enabled models
export const getEnabledModels = () => AVAILABLE_MODELS.filter(m => m.enabled);

// Quick toggle function
export const enableModel = (id: string) => {
  const model = AVAILABLE_MODELS.find(m => m.id === id);
  if (model) model.enabled = true;
};

export const disableModel = (id: string) => {
  const model = AVAILABLE_MODELS.find(m => m.id === id);
  if (model) model.enabled = false;
};
```

### Universal Model Query Service

```typescript
// services/modelProviders.ts

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { ModelConfig } from '@/config/models';

// Initialize clients (only if API key exists)
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const google = process.env.GOOGLE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
  : null;

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// Universal query function - works with ANY provider
export async function queryModel(config: ModelConfig, prompt: string): Promise<string> {
  switch (config.provider) {
    case 'anthropic':
      if (!anthropic) throw new Error('Anthropic API key not configured');
      const claudeRes = await anthropic.messages.create({
        model: config.model,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      });
      return claudeRes.content[0].type === 'text' ? claudeRes.content[0].text : '';

    case 'openai':
      if (!openai) throw new Error('OpenAI API key not configured');
      const gptRes = await openai.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return gptRes.choices[0].message.content || '';

    case 'google':
      if (!google) throw new Error('Google AI API key not configured');
      const geminiModel = google.getGenerativeModel({ model: config.model });
      const geminiRes = await geminiModel.generateContent(prompt);
      return geminiRes.response.text();

    case 'groq':
      if (!groq) throw new Error('Groq API key not configured');
      const groqRes = await groq.chat.completions.create({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
      });
      return groqRes.choices[0].message.content || '';

    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
```

### Dynamic Multi-Model Analysis

```typescript
// services/multiModelAnalysis.ts

import { getEnabledModels, ModelConfig } from '@/config/models';
import { queryModel } from './modelProviders';

interface ModelResponse {
  modelId: string;
  modelName: string;
  rating: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
}

interface ConsensusResult {
  responses: ModelResponse[];
  consensus: 'BUY' | 'SELL' | 'HOLD' | null;
  avgConfidence: number;
  hasConsensus: boolean;
  modelsUsed: number;
}

export async function analyzeWithAllModels(stockData: StockData): Promise<ConsensusResult> {
  const prompt = buildAnalysisPrompt(stockData);
  const enabledModels = getEnabledModels();

  if (enabledModels.length < 2) {
    throw new Error('At least 2 models must be enabled for consensus');
  }

  // Query all enabled models in parallel
  const results = await Promise.allSettled(
    enabledModels.map(async (config) => {
      const raw = await queryModel(config, prompt);
      const parsed = JSON.parse(raw);
      return {
        modelId: config.id,
        modelName: config.name,
        rating: parsed.rating,
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
      } as ModelResponse;
    })
  );

  // Filter successful responses
  const responses = results
    .filter((r): r is PromiseFulfilledResult<ModelResponse> => r.status === 'fulfilled')
    .map(r => r.value);

  // Calculate consensus
  const ratings = responses.map(r => r.rating);
  const buyCount = ratings.filter(r => r === 'BUY').length;
  const sellCount = ratings.filter(r => r === 'SELL').length;
  const holdCount = ratings.filter(r => r === 'HOLD').length;
  const total = responses.length;

  // Consensus = ALL models agree (configurable threshold)
  let consensus: 'BUY' | 'SELL' | 'HOLD' | null = null;
  if (buyCount === total) consensus = 'BUY';
  else if (sellCount === total) consensus = 'SELL';
  else if (holdCount === total) consensus = 'HOLD';

  const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / total;

  return {
    responses,
    consensus,
    avgConfidence,
    hasConsensus: consensus !== null,
    modelsUsed: total,
  };
}
```

### Switching Models

To switch from free to paid models, simply update `config/models.ts`:

```typescript
// Example: Switch to premium setup
// Disable free models
{ id: 'gemini-flash', ..., enabled: false },
{ id: 'groq-llama', ..., enabled: false },
{ id: 'groq-mixtral', ..., enabled: false },

// Enable paid models
{ id: 'claude-opus', ..., enabled: true },
{ id: 'gpt-4-turbo', ..., enabled: true },
{ id: 'gemini-pro', ..., enabled: true },
```

Or mix and match:
```typescript
// Hybrid setup (1 paid + 2 free)
{ id: 'claude-sonnet', ..., enabled: true },  // Paid
{ id: 'gemini-flash', ..., enabled: true },   // Free
{ id: 'groq-llama', ..., enabled: true },     // Free
```

### Data Sources
- **Stock Data:** Alpha Vantage, Polygon.io, or Yahoo Finance API
- **News/Sentiment:** NewsAPI, Finnhub

### Infrastructure (AWS)
- **Compute:** AWS Lambda (for scheduled analysis jobs)
- **Email:** AWS SES (Simple Email Service)
- **Storage:** S3 (for analysis history/reports)
- **Secrets:** AWS Secrets Manager (API keys)
- **CDN/Hosting:** Vercel or AWS Amplify

---

## Feature Breakdown

### Phase 1: Foundation (Weeks 1-2)

#### 1.1 User Authentication & Profiles
- Email/password auth (NextAuth.js or Clerk)
- User preferences storage
- Watchlist management

#### 1.2 Stock Data Integration
- Real-time stock quotes
- Historical price data (1D, 1W, 1M, 1Y charts)
- Basic company info (market cap, P/E, volume)

#### 1.3 Database Schema
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String?
  watchlist     Stock[]
  alerts        Alert[]
  preferences   UserPreferences?
  createdAt     DateTime @default(now())
}

model Stock {
  id            String   @id @default(cuid())
  symbol        String   @unique
  name          String
  sector        String?
  users         User[]
  analyses      Analysis[]
}

model Analysis {
  id            String   @id @default(cuid())
  stockId       String
  stock         Stock    @relation(fields: [stockId], references: [id])

  // Individual model responses
  claudeRating  String   // BUY, SELL, HOLD
  claudeScore   Float    // 0-100 confidence
  claudeReason  String   @db.Text

  gptRating     String
  gptScore      Float
  gptReason     String   @db.Text

  geminiRating  String
  geminiScore   Float
  geminiReason  String   @db.Text

  // Consensus
  consensus     String?  // BUY, SELL, HOLD, or null if no consensus
  avgConfidence Float?

  priceAtAnalysis Float
  createdAt     DateTime @default(now())
}

model Alert {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  stockSymbol   String
  alertType     String   // CONSENSUS_BUY, CONSENSUS_SELL
  message       String   @db.Text
  emailSent     Boolean  @default(false)
  createdAt     DateTime @default(now())
}

model UserPreferences {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])
  emailAlerts           Boolean  @default(true)
  minConsensusModels    Int      @default(3)  // How many models must agree
  minConfidenceScore    Float    @default(70) // Minimum avg confidence
  alertFrequency        String   @default("IMMEDIATE") // IMMEDIATE, DAILY_DIGEST
}
```

---

### Phase 2: Multi-Model Analysis Engine (Weeks 3-4)

#### 2.1 Analysis Prompt Template
```typescript
const buildAnalysisPrompt = (stockData: StockData) => `
You are a stock market analyst. Analyze the following stock and provide a recommendation.

**Stock:** ${stockData.symbol} (${stockData.name})
**Current Price:** $${stockData.price}
**52-Week Range:** $${stockData.low52w} - $${stockData.high52w}
**P/E Ratio:** ${stockData.pe}
**Market Cap:** ${stockData.marketCap}
**Volume:** ${stockData.volume} (Avg: ${stockData.avgVolume})

**Recent Price Action:**
${stockData.priceHistory.map(p => `${p.date}: $${p.close}`).join('\n')}

**Recent News Headlines:**
${stockData.news.map(n => `- ${n.headline}`).join('\n')}

**Technical Indicators:**
- RSI (14): ${stockData.rsi}
- 50-day MA: $${stockData.ma50}
- 200-day MA: $${stockData.ma200}
- MACD: ${stockData.macd}

Based on this data, provide:
1. **Rating:** BUY, SELL, or HOLD
2. **Confidence Score:** 0-100
3. **Reasoning:** 2-3 sentences explaining your recommendation

Respond in JSON format:
{
  "rating": "BUY" | "SELL" | "HOLD",
  "confidence": <number 0-100>,
  "reasoning": "<string>"
}
`;
```

#### 2.2 Multi-Model Query Service

See the **Flexible Model Architecture** section above for the complete implementation that supports all providers.

#### 2.3 Scheduled Analysis Jobs
- AWS Lambda function triggered by CloudWatch Events
- Runs analysis on all stocks in users' watchlists
- Configurable frequency (hourly during market hours, daily summary)

---

### Phase 3: Alert System (Week 5)

#### 3.1 Email Alert Service (AWS SES)
```typescript
// services/emailAlerts.ts

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface AlertEmailData {
  userEmail: string;
  userName: string;
  stockSymbol: string;
  consensus: 'BUY' | 'SELL';
  avgConfidence: number;
  modelResponses: Array<{ modelName: string; reasoning: string }>;
  currentPrice: number;
}

export async function sendConsensusAlert(data: AlertEmailData) {
  const ses = new SESClient({ region: 'us-east-1' });

  // Dynamically build model analysis section
  const modelAnalysisHtml = data.modelResponses
    .map(r => `<p><strong>${r.modelName}:</strong> ${r.reasoning}</p>`)
    .join('\n');

  const emailHtml = `
    <h2>🚨 Stock Alert: ${data.consensus} Signal for ${data.stockSymbol}</h2>
    <p>Hi ${data.userName},</p>
    <p>All ${data.modelResponses.length} AI models have reached a <strong>${data.consensus}</strong> consensus
       for <strong>${data.stockSymbol}</strong> with ${data.avgConfidence.toFixed(1)}%
       average confidence.</p>

    <h3>Current Price: $${data.currentPrice}</h3>

    <h3>Model Analysis:</h3>
    ${modelAnalysisHtml}

    <hr>
    <p><em>This is not financial advice. Always do your own research.</em></p>
  `;

  await ses.send(new SendEmailCommand({
    Source: 'alerts@yourstockapp.com',
    Destination: { ToAddresses: [data.userEmail] },
    Message: {
      Subject: { Data: `${data.consensus} Alert: ${data.stockSymbol}` },
      Body: { Html: { Data: emailHtml } },
    },
  }));
}
```

---

### Phase 4: Dashboard & UI (Weeks 6-7)

#### 4.1 Key Pages
```
/                     → Landing page
/dashboard            → User's watchlist + recent alerts
/stock/[symbol]       → Individual stock analysis view
/analyze              → On-demand analysis request
/history              → Past analyses and alerts
/settings             → User preferences, alert settings
```

#### 4.2 Dashboard Components
- **Watchlist Widget:** Quick view of tracked stocks with last analysis
- **Consensus Cards:** Visual display of model agreement
- **Analysis History:** Timeline of past recommendations
- **Alert Log:** Record of sent notifications

#### 4.3 Stock Detail Page
- Interactive price chart (TradingView widget or Recharts)
- Live model analysis display (3-column comparison)
- Historical analysis results
- "Analyze Now" button for on-demand analysis

---

## Project Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| 1 | Setup | Project scaffold, auth, database schema |
| 2 | Data | Stock API integration, basic stock pages |
| 3 | AI Core | Multi-model query service, prompt engineering |
| 4 | Analysis | Scheduled jobs, consensus logic, storage |
| 5 | Alerts | Email service, notification triggers |
| 6 | UI | Dashboard, stock detail pages |
| 7 | Polish | Charts, UX improvements, testing |
| 8 | Deploy | AWS infrastructure, production launch |

---

## Cost Considerations

### API Costs (Estimated Monthly)
| Service | Est. Usage | Est. Cost |
|---------|------------|-----------|
| Google Gemini API | Free tier | $0 |
| Groq API | Free tier | $0 |
| Stock Data API | Yahoo Finance (free) | $0 |
| AWS SES | ~1000 emails | $0.10 |
| AWS Lambda | ~100k invocations | $0-5 |
| Database (Supabase) | Free tier | $0 |

**Total Estimated:** $0-5/month

> **Note:** When ready for production with higher volume, you can upgrade to paid models like Claude Opus 4.5, GPT-4, etc. for improved analysis quality.

---

## Risk Disclaimers (Required)

**Important:** The app MUST include:
1. Clear disclaimer that this is NOT financial advice
2. Statement that AI analysis is experimental
3. Recommendation to consult financial advisors
4. Warning about investment risks
5. Terms of service limiting liability

---

## Future Enhancements (Post-MVP)

- **Upgrade to Paid Models:** Add Claude Opus 4.5, GPT-4, for better analysis
- **More Models:** Add Cohere, Anthropic Claude, OpenAI
- **Sentiment Analysis:** Twitter/Reddit sentiment scoring
- **Portfolio Tracking:** Connect brokerage accounts
- **Backtesting:** Test model accuracy on historical data
- **Mobile App:** React Native companion app
- **Webhook Alerts:** Slack, Discord, SMS integrations
- **Premium Tiers:** More frequent analysis, more stocks

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- API keys for: Anthropic, OpenAI, Google AI, Stock data provider
- AWS account (for SES, Lambda)

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# AI Models - Add keys as needed (only enabled models require keys)
# Free Tier
GOOGLE_AI_API_KEY="..."        # Get from ai.google.dev
GROQ_API_KEY="..."             # Get from console.groq.com

# Paid Tier (add when ready to upgrade)
ANTHROPIC_API_KEY="..."        # Get from console.anthropic.com
OPENAI_API_KEY="..."           # Get from platform.openai.com

# Stock Data (Free)
# Yahoo Finance - no API key needed (uses yfinance library)

# AWS
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

---

## Summary

This plan transforms your app into a sophisticated stock analysis tool that:

1. **Aggregates AI intelligence** from 3+ leading models
2. **Finds consensus** to filter out noise and increase signal quality
3. **Automates alerts** so users only get notified on high-confidence opportunities
4. **Maintains infrastructure** compatibility with your existing Next.js + AWS setup

The key differentiator is the **multi-model consensus approach** - users aren't trusting a single AI's opinion, but rather waiting for agreement across multiple independent AI systems, which should theoretically produce more reliable signals.
