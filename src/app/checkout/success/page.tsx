import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle2,
  Store,
  MapPin,
  Package,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';

export const metadata = {
  title: 'Order Placed Successfully — FreshGrocer',
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect('/marketplace');
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch parent order with partitioned suborders
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
        vendor:vendor_stores!vendor_orders_vendor_id_fkey(name, city),
        order_items:order_items(
          id,
          product_name_snapshot,
          unit_price_snapshot,
          quantity,
          line_total
        )
      )
    `)
    .eq('id', orderId)
    .eq('customer_id', user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const vendorOrders = (order.vendor_orders as any[]) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Order Placed Successfully!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Thank you for supporting local independent grocery businesses. Your order has been
          partitioned and forwarded to each vendor.
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono">
          <span>Order ID:</span>
          <span className="font-bold">{order.id}</span>
        </div>
      </div>

      {/* Delivery Summary */}
      <Card className="border-slate-200">
        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block font-semibold uppercase text-slate-400 mb-1">
              Delivering To
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
            <span className="text-slate-700 font-medium">{order.contact_phone}</span>
          </div>
        </CardContent>
      </Card>

      {/* Partitioned Sub-orders */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Partitioned Vendor Fulfillment Orders ({vendorOrders.length})
          </h2>
          <p className="text-xs text-slate-500">
            Each store independently fulfills and delivers their portion of your order.
          </p>
        </div>

        <div className="space-y-4">
          {vendorOrders.map((vo) => (
            <Card key={vo.id} className="border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-brand-600" />
                  <span className="font-bold text-sm text-slate-900">{vo.vendor?.name}</span>
                  <span className="text-xs text-slate-400">({vo.vendor?.city})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Fulfillment: {vo.status}</Badge>
                  <span className="font-black text-sm text-slate-900">
                    ${vo.subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <CardContent className="p-4 divide-y divide-slate-100">
                {vo.order_items?.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{item.quantity}x</span>
                      <span className="text-slate-700">{item.product_name_snapshot}</span>
                    </div>
                    <span className="font-semibold text-slate-800 font-mono">
                      ${item.line_total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-200">
        <Link href="/orders">
          <Button variant="outline" size="lg">
            <Package className="w-4 h-4 mr-1.5" /> View Order History
          </Button>
        </Link>
        <Link href="/marketplace">
          <Button size="lg" className="shadow-md">
            <ShoppingBag className="w-4 h-4 mr-1.5" /> Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}
