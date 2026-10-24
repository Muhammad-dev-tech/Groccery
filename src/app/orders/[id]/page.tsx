import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Clock,
  History,
  CheckCircle2,
} from 'lucide-react';

export const metadata = {
  title: 'Order Details — FreshGrocer',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=/orders/${id}`);
  }

  // Fetch full parent order with vendor suborders, items, and status history
  const { data: order, error } = await supabase
    .from('customer_orders')
    .select(`
      id,
      total_amount,
      currency,
      delivery_address,
      contact_phone,
      order_notes,
      created_at,
      vendor_orders:vendor_orders(
        id,
        subtotal,
        status,
        created_at,
        updated_at,
        vendor:vendor_stores!vendor_orders_vendor_id_fkey(name, city, contact_phone),
        order_items:order_items(
          id,
          product_name_snapshot,
          unit_price_snapshot,
          package_quantity_snapshot,
          unit_snapshot,
          quantity,
          line_total
        ),
        order_status_history:order_status_history(
          id,
          from_status,
          to_status,
          note,
          created_at
        )
      )
    `)
    .eq('id', id)
    .eq('customer_id', user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const subOrders = (order.vendor_orders as any[]) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Back Link */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
                Order #{order.id.slice(0, 8)}
              </h1>
              <Badge variant="brand">{subOrders.length} store partition{subOrders.length === 1 ? '' : 's'}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-semibold uppercase">
              Total Order Amount
            </span>
            <span className="text-2xl sm:text-3xl font-black text-brand-600">
              ₦{order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Delivery & Contact Card */}
      <Card className="border-slate-200">
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block font-semibold uppercase text-slate-400 mb-1">
              Delivery Address
            </span>
            <div className="flex items-start gap-1.5 text-slate-700 font-medium">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <span>{order.delivery_address}</span>
            </div>
          </div>
          <div>
            <span className="block font-semibold uppercase text-slate-400 mb-1">
              Contact Phone
            </span>
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{order.contact_phone}</span>
            </div>
            {order.order_notes && (
              <p className="text-slate-500 text-[11px] mt-1">
                <strong>Notes:</strong> {order.order_notes}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Partitioned Vendor Sub-orders */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Vendor Store Fulfillments ({subOrders.length})
          </h2>
          <p className="text-xs text-slate-500">
            Each store independently packs and delivers the items ordered from their catalog.
          </p>
        </div>

        <div className="space-y-6">
          {subOrders.map((so) => {
            const history = (so.order_status_history as any[]) || [];
            return (
              <Card key={so.id} className="border-slate-200 shadow-sm overflow-hidden">
                {/* Suborder Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-brand-600" />
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{so.vendor?.name}</h3>
                      <div className="text-[11px] text-slate-500">
                        {so.vendor?.city} · Contact: {so.vendor?.contact_phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant="warning">Status: {so.status}</Badge>
                    <span className="font-black text-sm text-slate-900">
                      ₦{so.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  {/* Item Rows */}
                  <div className="divide-y divide-slate-100">
                    {so.order_items?.map((it: any) => (
                      <div
                        key={it.id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900">
                            {it.quantity}x {it.product_name_snapshot}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ₦{it.unit_price_snapshot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} per pack ({it.package_quantity_snapshot} {it.unit_snapshot})
                          </div>
                        </div>

                        <span className="font-bold text-slate-800 font-mono">
                          ₦{it.line_total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status History Timeline */}
                  {history.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <History className="w-3 h-3" /> Status History
                      </span>
                      <div className="space-y-1.5 pl-2 border-l-2 border-slate-200">
                        {history.map((h: any) => (
                          <div key={h.id} className="text-[11px] text-slate-600 flex items-baseline gap-2">
                            <span className="font-bold text-slate-800 uppercase">
                              {h.to_status}
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-500">
                              {new Date(h.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {h.note && <span className="text-slate-400">({h.note})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
