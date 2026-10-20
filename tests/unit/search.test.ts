import { describe, it, expect } from 'vitest';
import { searchFilterSchema } from '@/domain/search/schema';

const validUUID1 = 'a0000000-0000-4000-8000-000000000001';
const validUUID2 = 'b0000000-0000-4000-8000-000000000002';

describe('Marketplace Search Filter Schema', () => {
  it('applies default pagination and sorting when given empty inputs', () => {
    const parsed = searchFilterSchema.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(12);
    expect(parsed.sort).toBe('relevance');
    expect(parsed.inStockOnly).toBe(false);
    expect(parsed.query).toBeUndefined();
    expect(parsed.categoryId).toBeUndefined();
    expect(parsed.vendorId).toBeUndefined();
  });

  it('accepts valid text query and trims whitespace', () => {
    const parsed = searchFilterSchema.parse({ query: '   organic milk   ' });
    expect(parsed.query).toBe('organic milk');
  });

  it('accepts valid UUIDs for category and vendor', () => {
    const parsed = searchFilterSchema.parse({
      categoryId: validUUID1,
      vendorId: validUUID2,
    });
    expect(parsed.categoryId).toBe(validUUID1);
    expect(parsed.vendorId).toBe(validUUID2);
  });

  it('allows empty string for categoryId and vendorId (cleared dropdowns)', () => {
    const parsed = searchFilterSchema.parse({
      categoryId: '',
      vendorId: '',
    });
    expect(parsed.categoryId).toBe('');
    expect(parsed.vendorId).toBe('');
  });

  it('coerces string numbers for price filters', () => {
    const parsed = searchFilterSchema.parse({
      minPrice: '2.50',
      maxPrice: '15.99',
    });
    expect(parsed.minPrice).toBe(2.50);
    expect(parsed.maxPrice).toBe(15.99);
  });

  it('rejects negative price bounds', () => {
    const resultMin = searchFilterSchema.safeParse({ minPrice: -5 });
    expect(resultMin.success).toBe(false);

    const resultMax = searchFilterSchema.safeParse({ maxPrice: -1 });
    expect(resultMax.success).toBe(false);
  });

  it('coerces string boolean for inStockOnly', () => {
    const parsedTrue = searchFilterSchema.parse({ inStockOnly: 'true' });
    expect(parsedTrue.inStockOnly).toBe(true);

    const parsedFalse = searchFilterSchema.parse({ inStockOnly: 'false' });
    expect(parsedFalse.inStockOnly).toBe(false);
  });

  it('supports all valid sort criteria', () => {
    const sorts = ['relevance', 'price_asc', 'price_desc', 'newest'] as const;
    for (const sort of sorts) {
      const parsed = searchFilterSchema.parse({ sort });
      expect(parsed.sort).toBe(sort);
    }
  });

  it('rejects invalid sort options', () => {
    const result = searchFilterSchema.safeParse({ sort: 'alphabetical_reverse' });
    expect(result.success).toBe(false);
  });

  it('enforces limit constraints (1 to 50)', () => {
    const parsedValid = searchFilterSchema.parse({ limit: 48 });
    expect(parsedValid.limit).toBe(48);

    const resultTooHigh = searchFilterSchema.safeParse({ limit: 100 });
    expect(resultTooHigh.success).toBe(false);

    const resultZero = searchFilterSchema.safeParse({ limit: 0 });
    expect(resultZero.success).toBe(false);
  });

  it('enforces page number min constraint (at least 1)', () => {
    const resultZero = searchFilterSchema.safeParse({ page: 0 });
    expect(resultZero.success).toBe(false);

    const resultNegative = searchFilterSchema.safeParse({ page: -3 });
    expect(resultNegative.success).toBe(false);

    const parsedCoerced = searchFilterSchema.parse({ page: '3' });
    expect(parsedCoerced.page).toBe(3);
  });
});
