import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { ModelConfig } from '@/config/models';

// Lazy initialization of clients to ensure env vars are loaded
let google: GoogleGenerativeAI | null = null;
let groq: Groq | null = null;
let openai: OpenAI | null = null;
let anthropic: Anthropic | null = null;

function getGoogleClient(): GoogleGenerativeAI | null {
  if (google === null && process.env.GOOGLE_AI_API_KEY) {
    google = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }
  return google;
}

function getGroqClient(): Groq | null {
  if (groq === null && process.env.GROQ_API_KEY) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

function getOpenAIClient(): OpenAI | null {
  if (openai === null && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
}

function getAnthropicClient(): Anthropic | null {
  if (anthropic === null && process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

export interface ModelQueryResult {
  content: string;
  model: string;
  provider: string;
  processingTimeMs: number;
}

/**
 * Query a specific AI model with a prompt
 */
export async function queryModel(
  config: ModelConfig,
  prompt: string
): Promise<ModelQueryResult> {
  const startTime = Date.now();

  let content: string;

  switch (config.provider) {
    case 'google':
      content = await queryGoogle(config.model, prompt);
      break;

    case 'groq':
      content = await queryGroq(config.model, prompt);
      break;

    case 'openai':
      content = await queryOpenAI(config.model, prompt);
      break;

    case 'anthropic':
      content = await queryAnthropic(config.model, prompt);
      break;

    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }

  return {
    content,
    model: config.model,
    provider: config.provider,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Query Google Gemini models
 */
async function queryGoogle(model: string, prompt: string): Promise<string> {
  const client = getGoogleClient();
  if (!client) {
    throw new Error('Google AI API key not configured');
  }

  const geminiModel = client.getGenerativeModel({ model });
  const result = await geminiModel.generateContent(prompt);
  const response = result.response;

  return response.text();
}

/**
 * Query Groq models (Llama, Mixtral)
 */
async function queryGroq(model: string, prompt: string): Promise<string> {
  const client = getGroqClient();
  if (!client) {
    throw new Error('Groq API key not configured');
  }

  const result = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.7,
  });

  return result.choices[0]?.message?.content || '';
}

/**
 * Query OpenAI models (GPT-4, GPT-4o, etc.)
 */
async function queryOpenAI(model: string, prompt: string): Promise<string> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const result = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.7,
  });

  return result.choices[0]?.message?.content || '';
}

/**
 * Query Anthropic Claude models
 */
async function queryAnthropic(model: string, prompt: string): Promise<string> {
  const client = getAnthropicClient();
  if (!client) {
    throw new Error('Anthropic API key not configured');
  }

  const result = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract text from content blocks
  const textContent = result.content.find(block => block.type === 'text');
  return textContent?.type === 'text' ? textContent.text : '';
}

/**
 * Check which providers are available based on configured API keys
 */
export function getAvailableProviders(): string[] {
  const providers: string[] = [];

  if (getGoogleClient()) providers.push('google');
  if (getGroqClient()) providers.push('groq');
  if (getOpenAIClient()) providers.push('openai');
  if (getAnthropicClient()) providers.push('anthropic');

  return providers;
}

/**
 * Check if a specific provider is available
 */
export function isProviderAvailable(provider: string): boolean {
  switch (provider) {
    case 'google':
      return getGoogleClient() !== null;
    case 'groq':
      return getGroqClient() !== null;
    case 'openai':
      return getOpenAIClient() !== null;
    case 'anthropic':
      return getAnthropicClient() !== null;
    default:
      return false;
  }
}
