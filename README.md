# AI Stock Trader

A multi-model AI consensus stock analysis application that leverages multiple AI models (Gemini, Llama, Mixtral, and optionally Claude, GPT-4) to analyze stocks and provide consensus-based buy/sell recommendations via email alerts.

## Core Concept

The **"AI Consensus" Approach:**
- Query 3+ AI models with the same stock data and analysis prompt
- Each model provides a recommendation (Buy/Sell/Hold) with confidence score
- When models reach consensus, trigger an email alert
- Users get notified only on high-confidence, multi-model agreement

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma 7
- **AI Models:** Gemini Flash, Groq (Llama, Mixtral), with optional Claude/GPT-4

## Prerequisites

- Node.js 18+
- PostgreSQL database (we recommend [Supabase](https://supabase.com) free tier)
- API keys for AI models (at least one required)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd agent-stock-trader
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Required: Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Required: At least one AI model API key
GOOGLE_AI_API_KEY="your-google-ai-key"    # https://ai.google.dev
GROQ_API_KEY="your-groq-key"              # https://console.groq.com

# Required: Auth secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
agent-stock-trader/
├── docs/                      # Documentation
│   ├── AGENT_STOCK_TRADER_PLAN.md   # Full project plan
│   └── DEVELOPMENT.md         # Development guide
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router pages
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   ├── stock/            # Stock-related components
│   │   └── analysis/         # Analysis components
│   ├── config/               # Configuration files
│   │   ├── constants.ts      # App constants
│   │   └── models.ts         # AI model configurations
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Library utilities
│   │   └── prisma.ts         # Prisma client
│   ├── services/             # Business logic services
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── .env.example              # Environment template
├── package.json
├── prisma.config.ts          # Prisma configuration
└── tsconfig.json
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Prisma Studio |

## AI Models

### Free Tier (Default)
| Model | Provider | Rate Limit |
|-------|----------|------------|
| Gemini 1.5 Flash | Google | 15 req/min |
| Llama 3.1 70B | Groq | 30 req/min |
| Mixtral 8x7B | Groq | 30 req/min |

### Paid Tier (Optional)
Enable in `src/config/models.ts` when ready:
- Claude Opus 4.5 / Sonnet 4 (Anthropic)
- GPT-4 Turbo / GPT-4o (OpenAI)
- Gemini 1.5 Pro (Google)

## Documentation

- [Development Guide](docs/DEVELOPMENT.md) - Detailed setup and development instructions
- [Project Plan](docs/AGENT_STOCK_TRADER_PLAN.md) - Full project architecture and roadmap

## Disclaimer

This application is for educational and informational purposes only. It is NOT financial advice. AI analysis is experimental. Always do your own research and consult with qualified financial advisors before making investment decisions.

## License

Private - All rights reserved
