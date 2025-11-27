import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPercent,
  formatLargeNumber,
  formatVolume,
  isValidSymbol,
  isValidEmail,
  calculateChange,
  calculateAverage,
  truncate,
  capitalize,
} from './index';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });
});

describe('formatPercent', () => {
  it('formats positive percentages with plus sign', () => {
    expect(formatPercent(5.5)).toBe('+5.50%');
  });

  it('formats negative percentages correctly', () => {
    expect(formatPercent(-3.25)).toBe('-3.25%');
  });

  it('formats zero correctly', () => {
    expect(formatPercent(0)).toBe('+0.00%');
  });

  it('respects custom decimal places', () => {
    expect(formatPercent(5.5555, 1)).toBe('+5.6%');
  });
});

describe('formatLargeNumber', () => {
  it('formats trillions correctly', () => {
    expect(formatLargeNumber(1_500_000_000_000)).toBe('1.50T');
  });

  it('formats billions correctly', () => {
    expect(formatLargeNumber(2_500_000_000)).toBe('2.50B');
  });

  it('formats millions correctly', () => {
    expect(formatLargeNumber(3_500_000)).toBe('3.50M');
  });

  it('formats thousands correctly', () => {
    expect(formatLargeNumber(4_500)).toBe('4.50K');
  });

  it('returns small numbers as-is', () => {
    expect(formatLargeNumber(500)).toBe('500');
  });
});

describe('formatVolume', () => {
  it('formats numbers with commas', () => {
    expect(formatVolume(1234567)).toBe('1,234,567');
  });
});

describe('isValidSymbol', () => {
  it('accepts valid stock symbols', () => {
    expect(isValidSymbol('AAPL')).toBe(true);
    expect(isValidSymbol('MSFT')).toBe(true);
    expect(isValidSymbol('A')).toBe(true);
    expect(isValidSymbol('GOOGL')).toBe(true);
  });

  it('accepts lowercase and converts', () => {
    expect(isValidSymbol('aapl')).toBe(true);
  });

  it('rejects invalid symbols', () => {
    expect(isValidSymbol('')).toBe(false);
    expect(isValidSymbol('TOOLONG')).toBe(false);
    expect(isValidSymbol('AA1')).toBe(false);
    expect(isValidSymbol('AA-B')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('missing@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
  });
});

describe('calculateChange', () => {
  it('calculates positive change correctly', () => {
    const result = calculateChange(110, 100);
    expect(result.change).toBe(10);
    expect(result.changePercent).toBe(10);
  });

  it('calculates negative change correctly', () => {
    const result = calculateChange(90, 100);
    expect(result.change).toBe(-10);
    expect(result.changePercent).toBe(-10);
  });

  it('handles zero previous value', () => {
    const result = calculateChange(100, 0);
    expect(result.change).toBe(100);
    expect(result.changePercent).toBe(0);
  });
});

describe('calculateAverage', () => {
  it('calculates average correctly', () => {
    expect(calculateAverage([10, 20, 30])).toBe(20);
  });

  it('returns 0 for empty array', () => {
    expect(calculateAverage([])).toBe(0);
  });

  it('handles single value', () => {
    expect(calculateAverage([42])).toBe(42);
  });
});

describe('truncate', () => {
  it('truncates long strings', () => {
    expect(truncate('Hello, World!', 10)).toBe('Hello, ...');
  });

  it('does not truncate short strings', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('handles already capitalized', () => {
    expect(capitalize('HELLO')).toBe('Hello');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});
