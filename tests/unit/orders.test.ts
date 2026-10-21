import { describe, it, expect } from 'vitest';
import {
  checkoutSchema,
  checkoutItemSchema,
  updateOrderStatusSchema,
} from '@/lib/validations/order';

const validUUID1 = 'a0000000-0000-4000-8000-000000000001';
const validUUID2 = 'b0000000-0000-4000-8000-000000000002';

describe('Checkout Validation Schemas', () => {
  it('validates a complete checkout payload', () => {
    const payload = {
      deliveryAddress: '104 Green Grove Way, Springfield, IL 62701',
      contactPhone: '+1 555-0101',
      orderNotes: 'Leave on porch near side entrance',
      items: [
        { productId: validUUID1, quantity: 2 },
        { productId: validUUID2, quantity: 1 },
      ],
    };

    const result = checkoutSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('rejects empty items array', () => {
    const payload = {
      deliveryAddress: '104 Green Grove Way, Springfield, IL 62701',
      contactPhone: '+1 555-0101',
      items: [],
    };

    const result = checkoutSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('items'));
      expect(issue?.message).toContain('cannot be empty');
    }
  });

  it('rejects delivery address shorter than 5 characters', () => {
    const payload = {
      deliveryAddress: '123',
      contactPhone: '+1 555-0101',
      items: [{ productId: validUUID1, quantity: 1 }],
    };

    const result = checkoutSchema.safeParse(payload);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path.includes('deliveryAddress'));
      expect(issue?.message).toContain('at least 5 characters');
    }
  });

  it('rejects zero or negative quantities in checkout item', () => {
    const resultZero = checkoutItemSchema.safeParse({
      productId: validUUID1,
      quantity: 0,
    });
    expect(resultZero.success).toBe(false);

    const resultNegative = checkoutItemSchema.safeParse({
      productId: validUUID1,
      quantity: -2,
    });
    expect(resultNegative.success).toBe(false);
  });

  it('rejects invalid product ID format in checkout item', () => {
    const result = checkoutItemSchema.safeParse({
      productId: 'invalid-not-uuid',
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe('Order Status Lifecycle Schema', () => {
  it('validates all valid order fulfillment status transitions', () => {
    const statuses = [
      'pending',
      'accepted',
      'preparing',
      'ready',
      'completed',
      'cancelled',
      'rejected',
    ] as const;

    for (const status of statuses) {
      const result = updateOrderStatusSchema.safeParse({
        vendorOrderId: validUUID1,
        newStatus: status,
        note: `Moved to ${status}`,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid or arbitrary status values', () => {
    const result = updateOrderStatusSchema.safeParse({
      vendorOrderId: validUUID1,
      newStatus: 'shipped_internationally',
    });
    expect(result.success).toBe(false);
  });
});
