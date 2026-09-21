import { describe, it, expect } from 'vitest';
import { batchGenerationSchema } from './batch';

describe('Batch Generation Schema', () => {
  it('accepts boundary values: 1 and 5000', () => {
    expect(batchGenerationSchema.safeParse({ count: 1 }).success).toBe(true);
    expect(batchGenerationSchema.safeParse({ count: 5000 }).success).toBe(true);
    expect(batchGenerationSchema.safeParse({ count: 250 }).success).toBe(true);
  });

  it('rejects values out of bounds (0, negative, >5000)', () => {
    expect(batchGenerationSchema.safeParse({ count: 0 }).success).toBe(false);
    expect(batchGenerationSchema.safeParse({ count: -10 }).success).toBe(false);
    expect(batchGenerationSchema.safeParse({ count: 5001 }).success).toBe(false);
  });

  it('rejects decimals and non-numeric inputs', () => {
    expect(batchGenerationSchema.safeParse({ count: 10.5 }).success).toBe(false);
    expect(batchGenerationSchema.safeParse({ count: '100' }).success).toBe(false);
  });
});
