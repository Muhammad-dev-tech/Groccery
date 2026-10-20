import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'success' | 'warning' | 'danger' | 'slate';
}

export function Badge({ className, variant = 'slate', children, ...props }: BadgeProps) {
  const variants = {
    brand: 'bg-brand-50 text-brand-700 border-brand-200/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
    danger: 'bg-red-50 text-red-700 border-red-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-smooth',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
