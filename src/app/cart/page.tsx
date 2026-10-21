'use client';

import * as React from 'react';
import Link from 'next/link';
import { useCart } from '@/domain/cart/context';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Store,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

export default function CartPage() {
  const { items, summary, isLoaded, updateQuantity, removeItem, clearCart, clearVendor } =
    useCart();

  if (!isLoaded) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-64 rounded-3xl bg-slate-50 animate-pulse border border-slate-200" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Your Cart is Empty</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Discover fresh staples, local produce, and compare unit prices across approved local
          vendors in your community.
        </p>
        <div className="pt-2">
          <Link href="/marketplace">
            <Button size="lg" className="shadow-md">
              <ShoppingBag className="w-4 h-4 mr-1.5" /> Browse Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {summary.totalItems} item{summary.totalItems === 1 ? '' : 's'} across{' '}
            <strong className="text-slate-800">
              {summary.vendorCount} independent store{summary.vendorCount === 1 ? '' : 's'}
            </strong>
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors self-start sm:self-auto"
        >
          Clear entire cart
        </button>
      </div>

      {/* Multi-Vendor Partitioning Transparency Banner */}
      {summary.vendorCount > 1 && (
        <div className="p-4 rounded-2xl bg-brand-50/80 border border-brand-200/80 text-brand-950 text-xs flex items-start gap-3 shadow-2xs">
          <Store className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-brand-900">Multi-Vendor Cart Partitioning</h4>
            <p className="text-brand-800 leading-relaxed">
              Your cart combines items from <strong>{summary.vendorCount} independent stores</strong>.
              Upon checkout, this order will be cleanly partitioned so each vendor independently
              fulfills and prepares their portion.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Vendor Partitions */}
        <div className="lg:col-span-2 space-y-6">
          {summary.partitions.map((partition) => (
            <div
              key={partition.vendorId}
              className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Partition Header */}
              <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-brand-600 flex items-center justify-center shadow-2xs">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{partition.vendorName}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{partition.vendorCity}</span>
                      <span>·</span>
                      <span>
                        {partition.itemCount} item{partition.itemCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-slate-900">
                    ${partition.subtotal.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => clearVendor(partition.vendorId)}
                    title="Remove all items from this store"
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Partition Items */}
              <div className="divide-y divide-slate-100 p-2">
                {partition.items.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                          🛒
                        </div>
                      )}
                      <div className="min-w-0 space-y-0.5">
                        <h4 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          {item.packageQuantity} {item.unitOfMeasurement} · ${item.price.toFixed(2)}{' '}
                          each
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Quantity Controller */}
                      <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-l-xl transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-r-xl transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right w-16">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Checkout Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-slate-200 sticky top-24 shadow-sm">
            <CardContent className="p-6 space-y-5">
              <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Total Items:</span>
                  <span className="font-semibold text-slate-800">{summary.totalItems}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Vendor Stores:</span>
                  <span className="font-semibold text-slate-800">{summary.vendorCount}</span>
                </div>

                {/* Per Vendor Subtotal Breakdown */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Vendor Subtotals
                  </span>
                  {summary.partitions.map((p) => (
                    <div key={p.vendorId} className="flex justify-between text-slate-600 text-[11px]">
                      <span className="truncate max-w-[170px]">{p.vendorName}</span>
                      <span className="font-mono font-medium">${p.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Grand Total:</span>
                  <span className="text-2xl font-black text-brand-600">
                    ${summary.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block w-full">
                <Button size="lg" className="w-full justify-center shadow-md">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transparent Multi-Vendor Delivery</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
