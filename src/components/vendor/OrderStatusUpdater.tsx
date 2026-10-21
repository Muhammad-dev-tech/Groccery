'use client';

import * as React from 'react';
import { updateVendorOrderStatusAction } from '@/app/vendor/orders/actions';
import type { OrderStatus } from '@/types/database.types';
import { Loader2 } from 'lucide-react';

const STATUS_FLOW: OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'completed',
  'cancelled',
  'rejected',
];

export function OrderStatusUpdater({
  vendorOrderId,
  currentStatus,
}: {
  vendorOrderId: string;
  currentStatus: OrderStatus;
}) {
  const [status, setStatus] = React.useState<OrderStatus>(currentStatus);
  const [loading, setLoading] = React.useState(false);

  async function handleStatusChange(newStatus: OrderStatus) {
    if (newStatus === status) return;

    setLoading(true);
    const res = await updateVendorOrderStatusAction({
      vendorOrderId,
      newStatus,
    });

    if (res.success) {
      setStatus(newStatus);
    } else {
      alert(res.error || 'Failed to update order status');
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
        Update Status:
      </span>
      <div className="relative">
        <select
          value={status}
          disabled={loading}
          onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
          className="rounded-xl border border-slate-200 bg-white py-1 px-2.5 text-xs font-semibold text-slate-700 focus:border-brand-500 focus:outline-none shadow-2xs"
        >
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, ' ').toUpperCase()}
            </option>
          ))}
        </select>
        {loading && (
          <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
          </div>
        )}
      </div>
    </div>
  );
}
