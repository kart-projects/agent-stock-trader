# Development Guide

This guide covers everything you need to know to develop and contribute to the AI Stock Trader project.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Development Commands](#development-commands)
- [Project Architecture](#project-architecture)
- [Code Conventions](#code-conventions)
- [AI Model Configuration](#ai-model-configuration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Environment Setup

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **PostgreSQL:** v14+ (or use Supabase)
- **Git:** Latest version

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd agent-stock-trader

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Configure your .env file (see below)

# 5. Generate Prisma client
npm run db:generate

# 6. Push database schema
npm run db:push

# 7. Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# ===========================================
# DATABASE
# ===========================================
# PostgreSQL connection string
# Supabase format: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
# Local format: postgresql://user:password@localhost:5432/agent_stock_trader
DATABASE_URL="postgresql://..."

# ===========================================
# AI MODEL API KEYS
# ===========================================
# Free Tier - At least one required
GOOGLE_AI_API_KEY=""        # Get from: https://ai.google.dev
GROQ_API_KEY=""             # Get from: https://console.groq.com

# Paid Tier - Optional
ANTHROPIC_API_KEY=""        # Get from: https://console.anthropic.com
OPENAI_API_KEY=""           # Get from: https://platform.openai.com

# ===========================================
# AUTHENTICATION
# ===========================================
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ===========================================
# AWS (Production only)
# ===========================================
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION="us-east-1"
AWS_SES_FROM_EMAIL="alerts@yourdomain.com"

# ===========================================
# FEATURE FLAGS
# ===========================================
NODE_ENV="development"
ENABLE_SCHEDULED_ANALYSIS="true"
ENABLE_EMAIL_ALERTS="true"
```

---

## Database Setup

### Using Supabase (Recommended)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database > Connection string
4. Copy the URI and add it to your `.env` as `DATABASE_URL`
5. Run `npm run db:push` to create tables

### Using Local PostgreSQL

```bash
# Create database
createdb agent_stock_trader

# Update .env
DATABASE_URL="postgresql://youruser:yourpassword@localhost:5432/agent_stock_trader"

# Push schema
npm run db:push
```

### Database Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma client from schema |
| `npm run db:push` | Push schema changes to database (dev) |
| `npm run db:migrate` | Create and run migrations (production) |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed database with initial data |

### Prisma Studio

Prisma Studio provides a visual interface to view and edit your data:

```bash
npm run db:studio
```

Opens at [http://localhost:5555](http://localhost:5555)

---

## Development Commands

### Core Commands

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

### Database Commands

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create migration (production)
npm run db:migrate

# Open database GUI
npm run db:studio
```

### Useful One-Liners

```bash
# Reset database (drops all data!)
npx prisma db push --force-reset

# Format Prisma schema
npx prisma format

# Validate Prisma schema
npx prisma validate

# View generated SQL
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma
```

---

## Project Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-related pages (grouped)
│   ├── api/               # API route handlers
│   │   ├── analysis/      # Analysis endpoints
│   │   ├── stocks/        # Stock data endpoints
│   │   └── user/          # User endpoints
│   ├── dashboard/         # Dashboard pages
│   ├── stock/[symbol]/    # Dynamic stock pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
│
├── components/            # React components
│   ├── ui/               # Base UI components (buttons, inputs, etc.)
│   ├── layout/           # Layout components (header, sidebar, etc.)
│   ├── stock/            # Stock-specific components
│   └── analysis/         # Analysis display components
│
├── config/               # Configuration
│   ├── constants.ts      # App-wide constants
│   └── models.ts         # AI model configurations
│
├── hooks/                # Custom React hooks
│   ├── useStock.ts       # Stock data hook
│   └── useAnalysis.ts    # Analysis hook
│
├── lib/                  # Core libraries
│   └── prisma.ts         # Prisma client singleton
│
├── services/             # Business logic
│   ├── modelProviders.ts # AI model API clients
│   ├── stockData.ts      # Stock data fetching
│   └── analysis.ts       # Analysis orchestration
│
├── types/                # TypeScript types
│   └── index.ts          # Shared type definitions
│
└── utils/                # Utility functions
    └── index.ts          # Helpers (formatting, validation, etc.)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/config/models.ts` | AI model configurations (enable/disable models) |
| `src/config/constants.ts` | App configuration constants |
| `src/lib/prisma.ts` | Database client singleton |
| `src/types/index.ts` | Shared TypeScript interfaces |
| `prisma/schema.prisma` | Database schema definition |
| `prisma.config.ts` | Prisma configuration (Prisma 7) |

---

## AI Model Configuration

### Enabling/Disabling Models

Edit `src/config/models.ts`:

```typescript
// Enable a free model
{
  id: 'gemini-flash',
  name: 'Gemini 1.5 Flash',
  provider: 'google',
  model: 'gemini-1.5-flash',
  enabled: true,  // ← Set to true
  // ...
}

// Disable a paid model
{
  id: 'claude-opus',
  name: 'Claude Opus 4.5',
  provider: 'anthropic',
  model: 'claude-opus-4-5-20251101',
  enabled: false,  // ← Set to false
  // ...
}
```

### Adding a New Model

1. Add the model config to `AVAILABLE_MODELS` in `src/config/models.ts`
2. Add the API client initialization in `src/services/modelProviders.ts`
3. Add the provider case in the `queryModel` function
4. Add the API key to `.env.example` and your `.env`

### Rate Limits

| Provider | Free Tier Limits |
|----------|-----------------|
| Google (Gemini) | 15 requests/min, 1M tokens/day |
| Groq | 30 requests/min |
| Anthropic | Pay-per-use only |
| OpenAI | Pay-per-use only |

---

## Code Conventions

### TypeScript

- Use strict TypeScript (`strict: true` in tsconfig)
- Define interfaces in `src/types/index.ts`
- Prefer `interface` over `type` for object shapes
- Use `const` assertions for literal types

### React Components

- Use functional components with hooks
- Place components in appropriate subdirectories
- Export components as named exports
- Use `React.FC` sparingly (prefer explicit props typing)

```typescript
// Good
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
  children: React.ReactNode;
}

export function Button({ variant, onClick, children }: ButtonProps) {
  // ...
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `StockCard.tsx` |
| Hooks | camelCase with `use` prefix | `useStockData.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types/Interfaces | PascalCase | `StockQuote` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Files | kebab-case or camelCase | `stock-card.tsx` |

### API Routes

- Use Next.js Route Handlers (App Router)
- Return consistent response shapes
- Handle errors gracefully

```typescript
// src/app/api/stocks/[symbol]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const data = await fetchStock(params.symbol);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Test Structure

```
__tests__/
├── components/          # Component tests
├── services/           # Service tests
├── utils/              # Utility tests
└── api/                # API route tests
```

---

## Troubleshooting

### Common Issues

#### Prisma Client Not Generated

```bash
# Error: @prisma/client did not initialize yet
npm run db:generate
```

#### Database Connection Failed

1. Check `DATABASE_URL` in `.env`
2. Ensure database server is running
3. Verify network access (for remote databases)

#### Build Errors After Schema Change

```bash
# Regenerate Prisma client
npm run db:generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

#### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. Check existing issues in the repository
2. Review the [Project Plan](./AGENT_STOCK_TRADER_PLAN.md)
3. Ask in team communication channels

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
