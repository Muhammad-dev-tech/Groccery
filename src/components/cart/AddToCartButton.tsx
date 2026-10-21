'use client';

import * as React from 'react';
import { useCart } from '@/domain/cart/context';
import { Button } from '@/components/ui/Button';
import { Plus, Check, ShoppingBag } from 'lucide-react';
import type { SearchProductItem } from '@/domain/search/query';

interface AddToCartButtonProps {
  product: SearchProductItem;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AddToCartButton({ product, size = 'sm', className }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const isOutOfStock = product.stockQuantity <= 0;
  const currentInCart = items.find((i) => i.productId === product.id)?.quantity || 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      vendorCity: product.vendorCity,
      name: product.name,
      price: product.price,
      unitOfMeasurement: product.unitOfMeasurement,
      packageQuantity: product.packageQuantity,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <Button
      type="button"
      size={size}
      onClick={handleAdd}
      disabled={isOutOfStock}
      variant={justAdded ? 'outline' : 'primary'}
      className={`w-full flex items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
        justAdded ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : ''
      } ${className || ''}`}
    >
      {justAdded ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>Added to Cart</span>
        </>
      ) : isOutOfStock ? (
        <span>Out of Stock</span>
      ) : currentInCart > 0 ? (
        <>
          <Plus className="w-3.5 h-3.5" />
          <span>Add More ({currentInCart} in Cart)</span>
        </>
      ) : (
        <>
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Add to Cart</span>
        </>
      )}
    </Button>
  );
}
