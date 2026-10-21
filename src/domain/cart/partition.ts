import type { CartItem, CartSummary, VendorCartPartition } from './types';
import { multiplyMoney, sumMoney } from '@/domain/money/arithmetic';

/**
 * Groups cart items by independent vendor store, computing accurate per-vendor subtotals
 * and grand total using safe integer cents arithmetic.
 */
export function partitionCartItems(items: CartItem[]): CartSummary {
  if (!items || items.length === 0) {
    return {
      partitions: [],
      totalItems: 0,
      totalPrice: 0,
      vendorCount: 0,
    };
  }

  const map = new Map<string, {
    vendorId: string;
    vendorName: string;
    vendorCity: string;
    items: CartItem[];
  }>();

  let grandTotalItems = 0;

  for (const item of items) {
    grandTotalItems += item.quantity;

    const existing = map.get(item.vendorId);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(item.vendorId, {
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        vendorCity: item.vendorCity,
        items: [item],
      });
    }
  }

  const partitions: VendorCartPartition[] = Array.from(map.values()).map((p) => {
    const itemSubtotals = p.items.map((item) => multiplyMoney(item.price, item.quantity));
    const subtotal = sumMoney(itemSubtotals);
    const itemCount = p.items.reduce((acc, curr) => acc + curr.quantity, 0);

    return {
      vendorId: p.vendorId,
      vendorName: p.vendorName,
      vendorCity: p.vendorCity,
      items: p.items,
      subtotal,
      itemCount,
    };
  });

  const partitionSubtotals = partitions.map((p) => p.subtotal);
  const totalPrice = sumMoney(partitionSubtotals);

  return {
    partitions,
    totalItems: grandTotalItems,
    totalPrice,
    vendorCount: partitions.length,
  };
}
