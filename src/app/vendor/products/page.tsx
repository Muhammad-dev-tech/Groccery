import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProductForm } from '@/components/vendor/ProductForm';
import { Store, Plus, AlertTriangle, Package, Check, EyeOff, Trash2 } from 'lucide-react';
import { toggleProductAvailabilityAction, archiveProductAction } from './actions';
import Link from 'next/link';

export const metadata = { title: 'Product Inventory — Vendor Hub' };

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; editId?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirectTo=/vendor/products');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.role !== 'vendor' && profile.role !== 'admin')) {
    redirect('/');
  }

  // Fetch vendor store
  const { data: store } = await supabase
    .from('vendor_stores')
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!store) {
    redirect('/vendor/register');
  }

  const isApproved = store.status === 'approved';

  // Fetch categories for the product form
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, icon')
    .order('display_order');

  // Fetch vendor's products
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(name, icon),
      images:product_images(image_url, is_primary)
    `)
    .eq('vendor_id', store.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  const isAdding = params.action === 'new';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
              <Package className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Store Products & Inventory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {store.name} · Managing active listings, prices, units, and inventory stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/vendor/dashboard">
            <Button variant="outline" size="sm">Back to Hub</Button>
          </Link>
          {isApproved ? (
            <Link href={isAdding ? '/vendor/products' : '/vendor/products?action=new'}>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                {isAdding ? 'Close Form' : 'Add New Product'}
              </Button>
            </Link>
          ) : (
            <Button size="sm" disabled title="Store must be approved by admin to add products">
              <Plus className="w-4 h-4 mr-1.5" />
              Add New Product (Locked)
            </Button>
          )}
        </div>
      </div>

      {/* Approval Status Banner if NOT approved */}
      {!isApproved && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              Store Publishing Locked ({store.status.toUpperCase()})
            </span>
            <p className="text-amber-800 text-xs leading-relaxed">
              Your store is currently in <span className="font-semibold">{store.status}</span> status. Only approved vendor stores can publish new products or accept customer orders. Platform administrators review newly registered stores for quality and authenticity.
            </p>
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      {isAdding && isApproved && (
        <div className="max-w-2xl">
          <ProductForm
            categories={categories || []}
          />
        </div>
      )}

      {/* Product Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catalog Items ({products?.length || 0})</CardTitle>
              <CardDescription>Live stock levels, unit configurations, and listed prices.</CardDescription>
            </div>
            <Badge variant={isApproved ? 'success' : 'warning'}>
              Store: {store.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">Package / Unit</th>
                  <th className="py-3 px-3">Stock</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products && products.length > 0 ? (
                  products.map((p) => {
                    const primaryImg = p.images?.find((img: any) => img.is_primary)?.image_url || p.images?.[0]?.image_url;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={p.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 font-bold text-xs">
                                {p.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-900">{p.name}</div>
                              {p.description && (
                                <div className="text-[11px] text-slate-400 line-clamp-1">{p.description}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {p.category?.icon ? `${p.category.icon} ` : ''}{p.category?.name || 'General'}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          ${p.price.toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-slate-700">{p.package_quantity} {p.unit_of_measurement}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold ${p.stock_quantity === 0 ? 'text-red-600' : p.stock_quantity < 10 ? 'text-amber-600' : 'text-slate-700'}`}>
                            {p.stock_quantity} in stock
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={p.is_available ? 'success' : 'slate'}>
                            {p.is_available ? 'Active' : 'Hidden'}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <form action={async () => {
                              'use server';
                              await toggleProductAvailabilityAction(p.id, !p.is_available);
                            }}>
                              <button
                                type="submit"
                                title={p.is_available ? 'Hide from marketplace' : 'Make active'}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                              >
                                {p.is_available ? <EyeOff className="w-4 h-4" /> : <Check className="w-4 h-4 text-emerald-600" />}
                              </button>
                            </form>
                            <form action={async () => {
                              'use server';
                              await archiveProductAction(p.id);
                            }}>
                              <button
                                type="submit"
                                title="Archive product"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No products added yet. Click &quot;Add New Product&quot; to publish your first grocery listing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
