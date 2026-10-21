import { describe, it, expect } from 'vitest';
import { partitionCartItems } from '@/domain/cart/partition';
import type { CartItem } from '@/domain/cart/types';

describe('Multi-Vendor Cart Partitioning & Monetary Arithmetic', () => {
  it('returns empty summary for empty or null item list', () => {
    const emptySummary = partitionCartItems([]);
    expect(emptySummary.partitions).toHaveLength(0);
    expect(emptySummary.totalItems).toBe(0);
    expect(emptySummary.totalPrice).toBe(0);
    expect(emptySummary.vendorCount).toBe(0);
  });

  it('groups items from the same store into a single partition', () => {
    const items: CartItem[] = [
      {
        productId: 'p-1',
        vendorId: 'vendor-1',
        vendorName: 'Organic Valley Market',
        vendorCity: 'Springfield',
        name: 'Organic Basmati Rice',
        price: 4.50,
        quantity: 2,
        unitOfMeasurement: 'kg',
        packageQuantity: 1,
        imageUrl: null,
        stockQuantity: 20,
      },
      {
        productId: 'p-2',
        vendorId: 'vendor-1',
        vendorName: 'Organic Valley Market',
        vendorCity: 'Springfield',
        name: 'Whole Milk',
        price: 1.80,
        quantity: 3,
        unitOfMeasurement: 'l',
        packageQuantity: 1,
        imageUrl: null,
        stockQuantity: 15,
      },
    ];

    const summary = partitionCartItems(items);
    expect(summary.vendorCount).toBe(1);
    expect(summary.partitions).toHaveLength(1);
    expect(summary.totalItems).toBe(5); // 2 + 3

    // 2 * 4.50 = 9.00; 3 * 1.80 = 5.40; Total = 14.40
    expect(summary.partitions[0].subtotal).toBeCloseTo(14.40, 2);
    expect(summary.totalPrice).toBeCloseTo(14.40, 2);
  });

  it('partitions items across multiple vendors without floating point drift', () => {
    const items: CartItem[] = [
      // Vendor A: 3 * $0.10 = $0.30 (classic IEEE 754 float hazard: 0.1 + 0.2 != 0.3)
      {
        productId: 'p-a',
        vendorId: 'vendor-a',
        vendorName: 'Store Alpha',
        vendorCity: 'Springfield',
        name: 'Item A',
        price: 0.10,
        quantity: 3,
        unitOfMeasurement: 'piece',
        packageQuantity: 1,
        imageUrl: null,
        stockQuantity: 50,
      },
      // Vendor B: 2 * $0.20 = $0.40
      {
        productId: 'p-b',
        vendorId: 'vendor-b',
        vendorName: 'Store Beta',
        vendorCity: 'Chicago',
        name: 'Item B',
        price: 0.20,
        quantity: 2,
        unitOfMeasurement: 'piece',
        packageQuantity: 1,
        imageUrl: null,
        stockQuantity: 50,
      },
    ];

    const summary = partitionCartItems(items);
    expect(summary.vendorCount).toBe(2);
    expect(summary.partitions).toHaveLength(2);
    expect(summary.totalItems).toBe(5);

    const partitionA = summary.partitions.find((p) => p.vendorId === 'vendor-a');
    const partitionB = summary.partitions.find((p) => p.vendorId === 'vendor-b');

    expect(partitionA?.subtotal).toBe(0.30);
    expect(partitionB?.subtotal).toBe(0.40);
    expect(summary.totalPrice).toBe(0.70);
  });
});
