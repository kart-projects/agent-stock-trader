import { describe, it, expect } from 'vitest';
import {
  AVAILABLE_MODELS,
  getEnabledModels,
  getModelById,
  getModelsByProvider,
  estimateCost,
} from './models';

describe('AVAILABLE_MODELS', () => {
  it('contains expected models', () => {
    expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);

    const modelIds = AVAILABLE_MODELS.map(m => m.id);
    expect(modelIds).toContain('gemini-flash');
    expect(modelIds).toContain('groq-llama');
    expect(modelIds).toContain('groq-llama-small');
  });

  it('has required properties on all models', () => {
    AVAILABLE_MODELS.forEach(model => {
      expect(model).toHaveProperty('id');
      expect(model).toHaveProperty('name');
      expect(model).toHaveProperty('provider');
      expect(model).toHaveProperty('model');
      expect(model).toHaveProperty('enabled');
      expect(model).toHaveProperty('costPerMillionTokens');
      expect(model.costPerMillionTokens).toHaveProperty('input');
      expect(model.costPerMillionTokens).toHaveProperty('output');
    });
  });
});

describe('getEnabledModels', () => {
  it('returns only enabled models', () => {
    const enabled = getEnabledModels();
    enabled.forEach(model => {
      expect(model.enabled).toBe(true);
    });
  });

  it('returns an array', () => {
    expect(Array.isArray(getEnabledModels())).toBe(true);
  });
});

describe('getModelById', () => {
  it('returns model when found', () => {
    const model = getModelById('gemini-flash');
    expect(model).toBeDefined();
    expect(model?.id).toBe('gemini-flash');
    expect(model?.provider).toBe('google');
  });

  it('returns undefined when not found', () => {
    const model = getModelById('non-existent-model');
    expect(model).toBeUndefined();
  });
});

describe('getModelsByProvider', () => {
  it('returns models for google provider', () => {
    const googleModels = getModelsByProvider('google');
    expect(googleModels.length).toBeGreaterThan(0);
    googleModels.forEach(model => {
      expect(model.provider).toBe('google');
    });
  });

  it('returns models for groq provider', () => {
    const groqModels = getModelsByProvider('groq');
    expect(groqModels.length).toBeGreaterThan(0);
    groqModels.forEach(model => {
      expect(model.provider).toBe('groq');
    });
  });

  it('returns empty array for unknown provider', () => {
    const models = getModelsByProvider('unknown' as never);
    expect(models).toEqual([]);
  });
});

describe('estimateCost', () => {
  it('returns 0 for free tier models', () => {
    const cost = estimateCost('gemini-flash', 1000, 500);
    expect(cost).toBe(0);
  });

  it('calculates cost for paid models correctly', () => {
    // GPT-4 Turbo: $10/M input, $30/M output
    const cost = estimateCost('gpt-4-turbo', 1_000_000, 1_000_000);
    expect(cost).toBe(40); // $10 + $30
  });

  it('returns 0 for non-existent model', () => {
    const cost = estimateCost('non-existent', 1000, 500);
    expect(cost).toBe(0);
  });
});
