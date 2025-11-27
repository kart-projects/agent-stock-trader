export type ModelProvider = 'anthropic' | 'openai' | 'google' | 'groq';

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  model: string;
  enabled: boolean;
  costPerMillionTokens: { input: number; output: number };
  maxTokens?: number;
  rateLimitPerMinute?: number;
}

// Define all available models - enable/disable as needed
export const AVAILABLE_MODELS: ModelConfig[] = [
  // === FREE TIER (Default) ===
  {
    id: 'gemini-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    model: 'gemini-1.5-flash',
    enabled: true,
    costPerMillionTokens: { input: 0, output: 0 },
    rateLimitPerMinute: 15,
  },
  {
    id: 'groq-llama',
    name: 'Llama 3.1 70B',
    provider: 'groq',
    model: 'llama-3.1-70b-versatile',
    enabled: true,
    costPerMillionTokens: { input: 0, output: 0 },
    rateLimitPerMinute: 30,
  },
  {
    id: 'groq-mixtral',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    model: 'mixtral-8x7b-32768',
    enabled: true,
    costPerMillionTokens: { input: 0, output: 0 },
    rateLimitPerMinute: 30,
  },

  // === PAID TIER (Enable when ready) ===
  {
    id: 'claude-opus',
    name: 'Claude Opus 4.5',
    provider: 'anthropic',
    model: 'claude-opus-4-5-20251101',
    enabled: false,
    costPerMillionTokens: { input: 15, output: 75 },
  },
  {
    id: 'claude-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    enabled: false,
    costPerMillionTokens: { input: 3, output: 15 },
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    model: 'gpt-4-turbo',
    enabled: false,
    costPerMillionTokens: { input: 10, output: 30 },
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    enabled: false,
    costPerMillionTokens: { input: 5, output: 15 },
  },
  {
    id: 'gemini-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    model: 'gemini-1.5-pro',
    enabled: false,
    costPerMillionTokens: { input: 3.5, output: 10.5 },
  },
];

// Get only enabled models
export const getEnabledModels = (): ModelConfig[] =>
  AVAILABLE_MODELS.filter(m => m.enabled);

// Get model by ID
export const getModelById = (id: string): ModelConfig | undefined =>
  AVAILABLE_MODELS.find(m => m.id === id);

// Get models by provider
export const getModelsByProvider = (provider: ModelProvider): ModelConfig[] =>
  AVAILABLE_MODELS.filter(m => m.provider === provider);

// Calculate estimated cost for a request
export const estimateCost = (
  modelId: string,
  inputTokens: number,
  outputTokens: number
): number => {
  const model = getModelById(modelId);
  if (!model) return 0;

  const inputCost = (inputTokens / 1_000_000) * model.costPerMillionTokens.input;
  const outputCost = (outputTokens / 1_000_000) * model.costPerMillionTokens.output;

  return inputCost + outputCost;
};
