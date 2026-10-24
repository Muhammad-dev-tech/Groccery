import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { analyzeShoppingListCost } from '@/domain/lists/analyzer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AddListItemForm } from '@/components/lists/AddListItemForm';
import { DeleteListItemButton } from '@/components/lists/DeleteListItemButton';
import { AddAllToCartButton } from '@/components/lists/AddAllToCartButton';
import {
  ArrowLeft,
  Sparkles,
  Store,
  TrendingDown,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const metadata = {
  title: 'Smart Cost Analysis — Shopping List',
};

export default async function ShoppingListDetailPage({
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
    redirect(`/login?redirectTo=/lists/${id}`);
  }

  // Fetch list details and categories for form
  const { data: list, error: listErr } = await supabase
    .from('shopping_lists')
    .select(`
      id,
      title,
      items:shopping_list_items(
        id,
        item_name,
        target_quantity,
        target_unit,
        category:categories(name)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (listErr || !list) {
    notFound();
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('display_order');

  const items = (list.items as any[]) || [];

  // Run the multi-vendor Smart Cost Analysis
  const analysis = await analyzeShoppingListCost(list.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Back Link */}
      <div>
        <Link
          href="/lists"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Lists
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {list.title}
              </h1>
              <Badge variant="brand">{items.length} item{items.length === 1 ? '' : 's'}</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cross-store price comparison and missing-item awareness across verified local vendors.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Items in List & Add Item Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Add Item Card */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-none">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Add Item to List</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AddListItemForm listId={list.id} categories={categories || []} />
            </CardContent>
          </Card>

          {/* Current Items List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              List Items ({items.length})
            </h3>

            {items.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                Add your first item above to activate live vendor cost comparison.
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-2xs overflow-hidden">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex items-center justify-between gap-2 hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900">
                        {item.item_name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Target: {item.target_quantity} {item.target_unit}
                        {item.category?.name ? ` · ${item.category.name}` : ''}
                      </p>
                    </div>
                    <DeleteListItemButton itemId={item.id} listId={list.id} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Multi-Vendor Cost Analysis Engine */}
        <div className="lg:col-span-2 space-y-6">
          {!analysis || analysis.totalItems === 0 ? (
            <Card className="border-slate-200 p-12 text-center text-slate-500">
              <Scale className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">No items to analyze yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Add products on the left to see which store offers the best value.
              </p>
            </Card>
          ) : (
            <>
              {/* Cost Analysis Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Single Best Store Card */}
                {analysis.bestSingleVendor && (
                  <Card className="border-slate-200 shadow-sm relative overflow-hidden bg-linear-to-br from-white to-slate-50">
                    <CardHeader className="pb-2 border-none">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Single Best Store
                        </span>
                        {analysis.bestSingleVendor.isFullyFulfilled ? (
                          <Badge variant="success">100% Complete</Badge>
                        ) : (
                          <Badge variant="warning">
                            {analysis.bestSingleVendor.fulfilledItemsCount}/{analysis.totalItems} Items
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base text-slate-900 mt-1">
                        {analysis.bestSingleVendor.vendorName}
                      </CardTitle>
                      <p className="text-xs text-slate-500">
                        {analysis.bestSingleVendor.vendorCity}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-2xl font-black text-slate-900">
                          ₦{analysis.bestSingleVendor.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-500 ml-1">for available items</span>
                      </div>
                      {!analysis.bestSingleVendor.isFullyFulfilled && (
                        <p className="text-[11px] text-amber-700 font-medium">
                          Missing: {analysis.bestSingleVendor.missingItemNames.join(', ')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 2. Optimal Multi-Vendor Split Card */}
                <Card className="border-brand-200/90 shadow-sm relative overflow-hidden bg-brand-50/40">
                  <CardHeader className="pb-2 border-none">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">
                        Optimal Multi-Vendor Split
                      </span>
                      <Badge variant="brand">
                        Across {analysis.optimalSplit.vendorsInvolvedCount} Stores
                      </Badge>
                    </div>
                    <CardTitle className="text-base text-slate-900 mt-1 flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4 text-brand-600" />
                      <span>Lowest Possible Basket Cost</span>
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Buying each item from its lowest-priced vendor
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-2xl font-black text-brand-600">
                        ₦{analysis.optimalSplit.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {analysis.optimalSplit.potentialSavingsVsSingleVendor !== undefined &&
                        analysis.optimalSplit.potentialSavingsVsSingleVendor > 0 && (
                          <span className="text-xs font-bold text-emerald-700 ml-2 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            Save ₦{analysis.optimalSplit.potentialSavingsVsSingleVendor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                    </div>
                    <AddAllToCartButton
                      items={analysis.optimalSplit.items}
                      label="Add Optimal Basket to Cart"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Vendor Breakdown Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Store-by-Store Fulfillment & Pricing Matrix
                  </h3>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Academic Integrity Guarantee:</strong> Stores with missing items are
                    never falsely presented as cheaper by discounting missing items as $0.00.
                    Unfulfilled items are explicitly documented below.
                  </p>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100">
                  {analysis.vendorAnalyses.map((v) => (
                    <div key={v.vendorId} className="p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="font-bold text-sm text-slate-900">{v.vendorName}</span>
                            <span className="text-xs text-slate-400 ml-1.5">({v.vendorCity})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {v.isFullyFulfilled ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Full Fulfillment ({v.fulfilledItemsCount}/{v.totalListItemsCount})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle className="w-3.5 h-3.5" /> Partial ({v.fulfilledItemsCount}/{v.totalListItemsCount})
                            </span>
                          )}

                          <span className="font-black text-sm text-slate-900 min-w-[70px] text-right">
                            ₦{v.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Missing items list if partial */}
                      {!v.isFullyFulfilled && v.missingItemNames.length > 0 && (
                        <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                          <span className="font-semibold text-slate-600">Unfulfilled items:</span>{' '}
                          <span className="text-amber-800 font-medium">
                            {v.missingItemNames.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
