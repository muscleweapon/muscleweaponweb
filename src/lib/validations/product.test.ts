import { describe, it, expect } from 'vitest';
import { productSchema, PRODUCT_CATEGORIES } from './product';

describe('Product Schema Validation', () => {
  it('accepts valid product with approved category', () => {
    const valid = {
      name: 'Muscle Weapon Whey Protein',
      slug: 'muscle-weapon-whey-protein',
      category: 'Protein',
      priceAmount: 3499,
      priceCurrency: 'INR',
      isVisible: true,
    };
    const result = productSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('strictly rejects unauthorized categories', () => {
    const invalid = {
      name: 'Test Supplement',
      slug: 'test-supplement',
      category: 'Unauthorized Category',
      isVisible: false,
    };
    const result = productSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('verifies all 7 approved categories are supported', () => {
    expect(PRODUCT_CATEGORIES).toHaveLength(7);
    for (const category of PRODUCT_CATEGORIES) {
      const result = productSchema.safeParse({
        name: `Test ${category}`,
        slug: `test-${category.toLowerCase().replace(/\s+/g, '-')}`,
        category,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects negative price', () => {
    const invalid = {
      name: 'Whey Protein',
      slug: 'whey-protein',
      category: 'Protein',
      priceAmount: -500,
    };
    const result = productSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
