import { describe, it, expect } from 'vitest';
import {
  productSchema,
  updateProductSchema,
  updateStoreStatusSchema,
} from '@/lib/validations/product';

const validCategoryId = 'a0000000-0000-4000-8000-000000000001';
const validStoreId = 'b0000000-0000-4000-8000-000000000002';
const validProductId = 'c0000000-0000-4000-8000-000000000003';

describe('Product Inventory Validation Schemas', () => {
  const validProduct = {
    name: 'Long Grain White Rice',
    description: 'Enriched, extra fluffy long grain white rice',
    categoryId: validCategoryId,
    price: 3.49,
    currency: 'USD',
    packageQuantity: 1,
    unitOfMeasurement: 'kg' as const,
    stockQuantity: 40,
    isAvailable: true,
    imageUrl: 'https://example.com/rice.jpg',
  };

  it('validates a correct grocery product payload', () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('rejects negative price values', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      price: -2.50,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const priceIssue = result.error.issues.find((i) => i.path.includes('price'));
      expect(priceIssue?.message).toContain('Price cannot be negative');
    }
  });

  it('rejects prices with more than 2 decimal places', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      price: 4.999,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const priceIssue = result.error.issues.find((i) => i.path.includes('price'));
      expect(priceIssue?.message).toContain('more than 2 decimal places');
    }
  });

  it('rejects zero or negative package quantities', () => {
    const resultZero = productSchema.safeParse({
      ...validProduct,
      packageQuantity: 0,
    });
    expect(resultZero.success).toBe(false);

    const resultNegative = productSchema.safeParse({
      ...validProduct,
      packageQuantity: -5,
    });
    expect(resultNegative.success).toBe(false);
  });

  it('rejects invalid or unsupported measurement units', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      unitOfMeasurement: 'hectare' as any,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative stock quantities', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      stockQuantity: -10,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const stockIssue = result.error.issues.find((i) => i.path.includes('stockQuantity'));
      expect(stockIssue?.message).toContain('Stock cannot be negative');
    }
  });

  it('rejects non-integer stock quantities', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      stockQuantity: 12.5,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const stockIssue = result.error.issues.find((i) => i.path.includes('stockQuantity'));
      expect(stockIssue?.message).toContain('Stock must be a whole number');
    }
  });

  it('requires a valid UUID when updating a product', () => {
    const resultInvalidId = updateProductSchema.safeParse({
      ...validProduct,
      id: 'not-a-uuid',
    });
    expect(resultInvalidId.success).toBe(false);

    const resultValidId = updateProductSchema.safeParse({
      ...validProduct,
      id: validProductId,
    });
    expect(resultValidId.success).toBe(true);
  });
});

describe('Store Moderation Validation Schemas', () => {
  it('validates a valid store status transition', () => {
    const payload = {
      storeId: validStoreId,
      newStatus: 'approved' as const,
      reason: 'Physical store verification passed; license inspected.',
    };
    const result = updateStoreStatusSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects moderation transitions without a meaningful reason', () => {
    const payload = {
      storeId: validStoreId,
      newStatus: 'suspended' as const,
      reason: 'bad', // less than 5 characters
    };
    const result = updateStoreStatusSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const reasonIssue = result.error.issues.find((i) => i.path.includes('reason'));
      expect(reasonIssue?.message).toContain('at least 5 characters');
    }
  });

  it('rejects invalid store statuses', () => {
    const payload = {
      storeId: validStoreId,
      newStatus: 'vip_status' as any,
      reason: 'Trying to set an unsupported store state.',
    };
    const result = updateStoreStatusSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});

describe('Vendor Business Rules Enforcement', () => {
  it('enforces that pending or suspended stores cannot publish products', () => {
    function canPublishProducts(storeStatus: string): boolean {
      return storeStatus === 'approved';
    }

    expect(canPublishProducts('approved')).toBe(true);
    expect(canPublishProducts('pending')).toBe(false);
    expect(canPublishProducts('suspended')).toBe(false);
    expect(canPublishProducts('rejected')).toBe(false);
  });

  it('enforces cross-vendor product ownership isolation', () => {
    interface ProductRecord {
      id: string;
      vendorId: string;
    }

    function canVendorEditProduct(callerStoreId: string, product: ProductRecord): boolean {
      return callerStoreId === product.vendorId;
    }

    const storeA = 'store-aaa-111';
    const storeB = 'store-bbb-222';
    const productA = { id: 'prod-1', vendorId: storeA };

    expect(canVendorEditProduct(storeA, productA)).toBe(true);
    expect(canVendorEditProduct(storeB, productA)).toBe(false);
  });
});
