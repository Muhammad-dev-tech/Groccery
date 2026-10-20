import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Store, Clock, CheckCircle2, XCircle, PauseCircle, Package, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import type { StoreStatus } from '@/types/database.types';
import Link from 'next/link';

export const metadata = { title: 'Vendor Hub — FreshGrocer' };

const STATUS_COPY: Record<StoreStatus, { label: string; variant: 'warning' | 'success' | 'danger' | 'slate'; text: string; Icon: typeof Clock }> = {
  pending: { label: 'Pending review', variant: 'warning', Icon: Clock, text: 'An administrator is reviewing your application. You cannot publish products until it is approved.' },
  approved: { label: 'Approved', variant: 'success', Icon: CheckCircle2, text: 'Your store is approved. You can manage products, pricing, and live inventory.' },
  rejected: { label: 'Rejected', variant: 'danger', Icon: XCircle, text: 'Your application was not approved. Please contact platform support for details.' },
  suspended: { label: 'Suspended', variant: 'slate', Icon: PauseCircle, text: 'Your store is suspended. You cannot publish products or accept new orders.' },
};

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/vendor/dashboard');

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
  if (!profile || (profile.role !== 'vendor' && profile.role !== 'admin')) redirect('/');

  const { data: store } = await supabase
    .from('vendor_stores')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!store) {
    redirect('/vendor/register');
  }

  // Fetch count of products and low stock count
  const { data: products } = await supabase
    .from('products')
    .select('id, stock_quantity, is_available')
    .eq('vendor_id', store.id)
    .eq('is_archived', false);

  const totalProducts = products?.length || 0;
  const activeProducts = products?.filter((p) => p.is_available).length || 0;
  const lowStockProducts = products?.filter((p) => p.stock_quantity < 10).length || 0;

  const s = STATUS_COPY[store.status];

  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
              <Store className="w-5 h-5" aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {store.name}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {store.city}, {store.state} · Owner: {profile.full_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={s.variant}>{s.label}</Badge>
          <Link href="/vendor/service-areas">
            <Button size="sm" variant="outline">
              <Store className="w-4 h-4 mr-1.5 text-brand-600" />
              Delivery Zones
            </Button>
          </Link>
          <Link href="/vendor/products">
            <Button size="sm">
              <Package className="w-4 h-4 mr-1.5" />
              Manage Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Store Status Notification */}
      <Card>
        <CardContent className="pt-6 flex items-start gap-3.5">
          <s.Icon className="w-5 h-5 shrink-0 text-slate-500 mt-0.5" aria-hidden />
          <div className="space-y-1">
            <div className="font-semibold text-sm text-slate-900">
              Store Status: {s.label}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {s.text}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Total Products</CardTitle>
            <Package className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{totalProducts}</div>
            <p className="text-xs text-slate-500 mt-1">{activeProducts} active in marketplace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Low Stock Alert</CardTitle>
            <AlertTriangle className={`w-4 h-4 ${lowStockProducts > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${lowStockProducts > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {lowStockProducts}
            </div>
            <p className="text-xs text-slate-500 mt-1">Items with less than 10 units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Sales & Orders</CardTitle>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">Phase 5</div>
            <p className="text-xs text-slate-500 mt-1">Order workflow activates in Phase 5</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="hover:border-brand-300 transition-colors">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Product & Inventory Management</CardTitle>
            <CardDescription>
              Create grocery items, set price per package, configure units (kg, g, L, mL, piece), and adjust live stock counts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/vendor/products">
              <Button variant="outline" className="w-full justify-between">
                <span>Open Product Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-brand-300 transition-colors">
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Delivery & Service Zones</CardTitle>
            <CardDescription>
              Configure postal codes, neighborhoods, and delivery sectors served by your store.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-slate-600 space-y-1">
              <div><span className="font-semibold">Store Address:</span> {store.address || 'Not specified'}, {store.city}, {store.state}</div>
              <div><span className="font-semibold">Phone:</span> {store.contact_phone}</div>
            </div>
            <Link href="/vendor/service-areas">
              <Button variant="outline" className="w-full justify-between">
                <span>Configure Service Zones</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
