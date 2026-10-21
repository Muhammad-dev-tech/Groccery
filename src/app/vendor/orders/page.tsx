import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, PackageCheck, MapPin, Phone, Calendar, Clock } from 'lucide-react';
import { OrderStatusUpdater } from '@/components/vendor/OrderStatusUpdater';

export const metadata = {
  title: 'Order Fulfillment Hub — Vendor Hub',
};

export default async function VendorOrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/vendor/orders');
  }

  const { data: store } = await supabase
    .from('vendor_stores')
    .select('id, name')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    redirect('/vendor/register');
  }

  // Fetch all vendor suborders for this store
  const { data: orders } = await supabase
    .from('vendor_orders')
    .select(`
      id,
      subtotal,
      status,
      created_at,
      customer_order:customer_orders!vendor_orders_customer_order_id_fkey(
        id,
        delivery_address,
        contact_phone,
        order_notes,
        created_at
      ),
      order_items:order_items(
        id,
        product_name_snapshot,
        unit_price_snapshot,
        quantity,
        line_total
      )
    `)
    .eq('vendor_id', store.id)
    .order('created_at', { ascending: false });

  const vendorOrders = orders || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/vendor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Vendor Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Order Fulfillment Hub
              </h1>
              <Badge variant="brand">{vendorOrders.length} order{vendorOrders.length === 1 ? '' : 's'}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Fulfill, pack, and update live order delivery status for {store.name}.
            </p>
          </div>
        </div>
      </div>

      {vendorOrders.length === 0 ? (
        <Card className="border-slate-200 py-16 text-center">
          <CardContent className="max-w-md mx-auto space-y-3">
            <PackageCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-500">
              When customers checkout items from your store in the marketplace, their partitioned sub-order will appear here for packing and fulfillment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {vendorOrders.map((order) => {
            const customerOrder = order.customer_order as any;
            return (
              <Card key={order.id} className="border-slate-200 overflow-hidden shadow-2xs">
                {/* Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      Suborder: {order.id.slice(0, 8)}...
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(order.created_at).toLocaleDateString()} at{' '}
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-slate-900">
                      ${order.subtotal.toFixed(2)}
                    </span>
                    <OrderStatusUpdater
                      vendorOrderId={order.id}
                      currentStatus={order.status as any}
                    />
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Delivery Info */}
                  {customerOrder && (
                    <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-start gap-1.5 text-slate-700">
                        <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span>{customerOrder.delivery_address}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-700 sm:justify-end">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{customerOrder.contact_phone}</span>
                      </div>
                      {customerOrder.order_notes && (
                        <div className="sm:col-span-2 text-slate-500 text-[11px] pt-1 border-t border-slate-200/50">
                          <strong>Note:</strong> {customerOrder.order_notes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div className="divide-y divide-slate-100">
                    {order.order_items?.map((it: any) => (
                      <div
                        key={it.id}
                        className="py-2 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{it.quantity}x</span>
                          <span className="text-slate-700">{it.product_name_snapshot}</span>
                        </div>
                        <span className="font-medium text-slate-700 font-mono">
                          ${it.line_total.toFixed(2)}
                        </span>
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
