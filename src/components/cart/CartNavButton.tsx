'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/domain/cart/context';

interface CartNavButtonProps {
  onClick?: () => void;
  className?: string;
}

export function CartNavButton({ onClick, className }: CartNavButtonProps) {
  const { summary, isLoaded } = useCart();

  const count = isLoaded ? summary.totalItems : 0;

  return (
    <Link
      id="nav-cart-btn"
      href="/cart"
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 hover:bg-brand-50 text-slate-800 hover:text-brand-700 border border-slate-200 hover:border-brand-200 transition-colors ${
        className || ''
      }`}
      aria-label={`Shopping cart with ${count} items`}
    >
      <ShoppingCart className="w-4 h-4 text-brand-600" />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span
          id="cart-badge-count"
          className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black rounded-full bg-brand-600 text-white animate-in zoom-in-75 duration-150"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
