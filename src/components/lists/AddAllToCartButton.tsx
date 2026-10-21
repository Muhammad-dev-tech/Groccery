'use client';

import * as React from 'react';
import { useCart } from '@/domain/cart/context';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, Check } from 'lucide-react';
import type { OptimalSplitItem } from '@/domain/lists/analyzer';

export function AddAllToCartButton({
  items,
  label = 'Add All Optimal Items to Cart',
}: {
  items: OptimalSplitItem[];
  label?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = React.useState(false);

  function handleAddAll() {
    for (const it of items) {
      addItem({
        productId: it.product.productId,
        vendorId: it.bestVendorId,
        vendorName: it.bestVendorName,
        vendorCity: it.bestVendorCity,
        name: it.product.name,
        price: it.product.price,
        unitOfMeasurement: it.product.unitOfMeasurement,
        packageQuantity: it.product.packageQuantity,
        imageUrl: null,
        stockQuantity: it.product.stockQuantity,
      });
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (items.length === 0) return null;

  return (
    <Button
      type="button"
      size="sm"
      onClick={handleAddAll}
      variant={added ? 'outline' : 'primary'}
      className={`w-full flex items-center justify-center gap-1.5 font-bold shadow-sm ${
        added ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''
      }`}
    >
      {added ? (
        <>
          <Check className="w-4 h-4 text-emerald-600" />
          <span>All Items Added to Cart!</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
