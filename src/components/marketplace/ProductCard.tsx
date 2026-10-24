import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, Scale, Store, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { SearchProductItem } from '@/domain/search/query';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface ProductCardProps {
  product: SearchProductItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-premium transition-smooth group border-slate-200/90">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <span className="text-4xl">{product.categoryIcon || '🛒'}</span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-slate-700 shadow-sm backdrop-blur-sm">
            {product.categoryIcon && <span>{product.categoryIcon}</span>}
            <span>{product.categoryName}</span>
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <Badge variant="danger">Out of stock</Badge>
          ) : product.stockQuantity < 10 ? (
            <Badge variant="warning">Only {product.stockQuantity} left</Badge>
          ) : (
            <Badge variant="success">In stock</Badge>
          )}
        </div>
      </div>

      {/* Product Details */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Vendor store & location */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{product.vendorName}</span>
              <span className="text-slate-300">·</span>
              <span className="flex items-center gap-0.5 text-slate-400 shrink-0">
                <MapPin className="w-3 h-3" />
                {product.vendorCity}
              </span>
            </div>

            {product.servesSelectedLocation && (
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> Delivers to your zone
                </span>
              </div>
            )}
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-sm sm:text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
            {product.name}
          </h3>

          {/* Package quantity snapshot */}
          <div className="text-xs text-slate-500">
            Package: <span className="font-semibold text-slate-700">{product.packageQuantity} {product.unitOfMeasurement}</span>
          </div>
        </div>

        {/* Pricing Matrix */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-baseline justify-between">
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                ₦{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-slate-500 font-normal">/ pack</span>
            </div>

            {/* Dimension-Safe Normalized Price Badge */}
            <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60" title="Normalized standard price">
              <Scale className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{product.normalizedPrice.formattedComparison}</span>
            </div>
          </div>

          {/* Action Triggers */}
          <div className="pt-1 space-y-2">
            <AddToCartButton product={product} />

            <Link href={`/marketplace/compare?productId=${product.id}`} className="w-full block">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold justify-center hover:border-brand-500 hover:text-brand-600 group/btn"
              >
                <span>Compare Across Vendors</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
