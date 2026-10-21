import { describe, it, expect } from 'vitest';
import { multiplyMoney, sumMoney } from '@/domain/money/arithmetic';

describe('Smart Shopping List Cost Analysis Rules', () => {
  interface MockProduct {
    id: string;
    vendorId: string;
    vendorName: string;
    name: string;
    price: number;
  }

  interface MockListItem {
    id: string;
    itemName: string;
  }

  const listItems: MockListItem[] = [
    { id: 'item-1', itemName: 'Royal Basmati Rice' },
    { id: 'item-2', itemName: 'Pure Farm Milk' },
    { id: 'item-3', itemName: 'Extra Virgin Olive Oil' },
  ];

  // Store Alpha carries all 3 items
  const storeAlphaProducts: MockProduct[] = [
    { id: 'p-a1', vendorId: 'vendor-alpha', vendorName: 'Store Alpha', name: 'Royal Basmati Rice', price: 4.50 },
    { id: 'p-a2', vendorId: 'vendor-alpha', vendorName: 'Store Alpha', name: 'Pure Farm Milk', price: 1.80 },
    { id: 'p-a3', vendorId: 'vendor-alpha', vendorName: 'Store Alpha', name: 'Extra Virgin Olive Oil', price: 6.00 },
  ];

  // Store Beta carries only 2 items (MISSING Olive Oil)
  const storeBetaProducts: MockProduct[] = [
    { id: 'p-b1', vendorId: 'vendor-beta', vendorName: 'Store Beta', name: 'Royal Basmati Rice', price: 3.60 },
    { id: 'p-b2', vendorId: 'vendor-beta', vendorName: 'Store Beta', name: 'Pure Farm Milk', price: 1.60 },
  ];

  it('guarantees missing items are never counted as free / $0.00 in store totals', () => {
    function evaluateStore(storeName: string, catalog: MockProduct[]) {
      const fulfilled: MockProduct[] = [];
      const missing: string[] = [];

      for (const req of listItems) {
        const found = catalog.find((c) => c.name === req.itemName);
        if (found) {
          fulfilled.push(found);
        } else {
          missing.push(req.itemName);
        }
      }

      const totalCost = sumMoney(fulfilled.map((p) => p.price));
      const isComplete = missing.length === 0;

      return {
        storeName,
        fulfilledCount: fulfilled.length,
        totalItems: listItems.length,
        isComplete,
        missing,
        totalCost,
      };
    }

    const alpha = evaluateStore('Store Alpha', storeAlphaProducts);
    const beta = evaluateStore('Store Beta', storeBetaProducts);

    // Alpha has all 3: 4.50 + 1.80 + 6.00 = 12.30
    expect(alpha.isComplete).toBe(true);
    expect(alpha.fulfilledCount).toBe(3);
    expect(alpha.missing).toHaveLength(0);
    expect(alpha.totalCost).toBe(12.30);

    // Beta has only 2: 3.60 + 1.60 = 5.20, but is missing Olive Oil
    expect(beta.isComplete).toBe(false);
    expect(beta.fulfilledCount).toBe(2);
    expect(beta.missing).toContain('Extra Virgin Olive Oil');
    expect(beta.totalCost).toBe(5.20);

    // Beta cannot be declared the best complete basket over Alpha simply because it sells fewer items!
    function determineBestFullStore(stores: ReturnType<typeof evaluateStore>[]) {
      const completeStores = stores.filter((s) => s.isComplete);
      if (completeStores.length === 0) return null;
      return completeStores.sort((a, b) => a.totalCost - b.totalCost)[0];
    }

    const bestFullStore = determineBestFullStore([alpha, beta]);
    expect(bestFullStore?.storeName).toBe('Store Alpha');
  });

  it('calculates optimal multi-vendor split and verifies cross-vendor savings', () => {
    // Finding cheapest price for each item across both stores:
    // Item 1 (Rice): Beta ($3.60) vs Alpha ($4.50) -> Beta ($3.60)
    // Item 2 (Milk): Beta ($1.60) vs Alpha ($1.80) -> Beta ($1.60)
    // Item 3 (Oil): Only Alpha ($6.00) -> Alpha ($6.00)
    // Optimal Split Basket Total: 3.60 + 1.60 + 6.00 = $11.20 across 2 vendors.
    const allProducts = [...storeAlphaProducts, ...storeBetaProducts];

    const optimalItems = listItems.map((li) => {
      const candidates = allProducts.filter((p) => p.name === li.itemName);
      candidates.sort((a, b) => a.price - b.price);
      return candidates[0];
    });

    const optimalTotal = sumMoney(optimalItems.map((i) => i.price));
    expect(optimalTotal).toBe(11.20);

    // Single Store Alpha total was 12.30
    // Multi-Vendor Savings = 12.30 - 11.20 = $1.10
    const singleStoreTotal = 12.30;
    const savings = Math.round((singleStoreTotal - optimalTotal) * 100) / 100;
    expect(savings).toBe(1.10);
  });
});
