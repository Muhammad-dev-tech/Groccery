import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  PackageCheck,
  Store,
  MapPin,
  Clock,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const metadata = {
  title: 'My Orders — FreshGrocer',
  description: 'View your multi-vendor grocery order history and live fulfillment tracking.',
};

export default async function CustomerOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/orders');
  }

  const { data: orders } = await supabase
    .from('customer_orders')
    .select(`
      id,
      total_amount,
      currency,
      delivery_address,
      created_at,
      vendor_orders:vendor_orders(
        id,
        subtotal,
        status,
        vendor:vendor_stores!vendor_orders_vendor_id_fkey(name, city),
        order_items:order_items(id, quantity, product_name_snapshot)
      )
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });

  const allOrders = orders || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
              <PackageCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              My Orders
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Track fulfillment and delivery progress across each vendor partition.
          </p>
        </div>
      </div>

      {allOrders.length === 0 ? (
        <Card className="border-slate-200 py-16 text-center">
          <CardContent className="max-w-md mx-auto space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Orders Yet</h3>
            <p className="text-xs text-slate-500">
              When you place an order in the marketplace, your order and vendor fulfillment progress
              will be tracked here.
            </p>
            <div className="pt-2">
              <Link href="/marketplace">
                <Button size="sm">Browse Marketplace</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {allOrders.map((order) => {
            const subOrders = (order.vendor_orders as any[]) || [];
            return (
              <Card
                key={order.id}
                className="border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-sm">{order.delivery_address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                        Total
                      </span>
                      <span className="text-base font-black text-brand-600">
                        ${order.total_amount.toFixed(2)}
                      </span>
                    </div>

                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Partitioned Sub-orders preview */}
                <CardContent className="p-4 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Partitioned Store Fulfillments ({subOrders.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {subOrders.map((so) => (
                      <div
                        key={so.id}
                        className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {so.vendor?.name}
                          </span>
                          <Badge variant="brand" className="text-[10px]">
                            {so.status}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {so.order_items?.length || 0} item{so.order_items?.length === 1 ? '' : 's'} ·{' '}
                          <span className="font-semibold text-slate-700">
                            ${so.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
