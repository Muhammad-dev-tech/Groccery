import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { searchMarketplaceProducts, type SearchFilterInput } from '@/domain/search/query';
import { DEMO_CATEGORIES, DEMO_VENDORS } from '@/domain/search/demoData';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { SearchFilters } from '@/components/marketplace/SearchFilters';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ShoppingBag, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Marketplace Catalog — FreshGrocer',
  description: 'Search and compare grocery products and prices across verified local independent vendors.',
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  // Extract query filters
  const rawFilters: Partial<SearchFilterInput> = {
    query: typeof params.query === 'string' ? params.query : undefined,
    categoryId: typeof params.categoryId === 'string' ? params.categoryId : undefined,
    vendorId: typeof params.vendorId === 'string' ? params.vendorId : undefined,
    postalCode: typeof params.postalCode === 'string' ? params.postalCode : undefined,
    city: typeof params.city === 'string' ? params.city : undefined,
    minPrice: typeof params.minPrice === 'string' ? Number(params.minPrice) : undefined,
    maxPrice: typeof params.maxPrice === 'string' ? Number(params.maxPrice) : undefined,
    inStockOnly: params.inStockOnly === 'true',
    sort: (['relevance', 'price_asc', 'price_desc', 'newest'].includes(String(params.sort))
      ? params.sort
      : 'relevance') as any,
    page: typeof params.page === 'string' ? Math.max(1, parseInt(params.page, 10)) : 1,
    limit: 12,
  };

  const supabase = await createClient();

  // Fetch all active categories
  let categories: Array<{ id: string; name: string; icon: string | null }> = [];
  let vendors: Array<{ id: string; name: string; city: string }> = [];

  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('id, name, icon')
      .order('display_order');
    if (catData && catData.length > 0) categories = catData;

    const { data: vData } = await supabase
      .from('vendor_stores')
      .select('id, name, city')
      .eq('status', 'approved')
      .order('name');
    if (vData && vData.length > 0) vendors = vData;
  } catch {
    // Ignore when offline or unconfigured
  }

  if (categories.length === 0) categories = DEMO_CATEGORIES;
  if (vendors.length === 0) vendors = DEMO_VENDORS;

  // Execute marketplace query
  const searchResult = await searchMarketplaceProducts(rawFilters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand-50 text-brand-700">
              <ShoppingBag className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Marketplace Grocery Discovery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare equivalent items across independent stores with transparent $/kg & $/L normalization.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="text-slate-900">{searchResult.products.length}</span> of{' '}
          <span className="text-slate-900">{searchResult.totalCount}</span> products
        </div>
      </div>

      {/* Location Coverage Notification Banner */}
      {searchResult.locationCoverage?.isFilteredByLocation && (
        <div>
          {searchResult.locationCoverage.isCovered ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                <span>
                  Filtering vendors serving{' '}
                  <strong className="font-bold">
                    {searchResult.locationCoverage.postalCode
                      ? `ZIP ${searchResult.locationCoverage.postalCode}`
                      : searchResult.locationCoverage.city}
                  </strong>{' '}
                  ({searchResult.locationCoverage.totalApprovedVendorsInZone} active store
                  {searchResult.locationCoverage.totalApprovedVendorsInZone === 1 ? '' : 's'})
                </span>
              </div>
              <Link
                href="/marketplace"
                className="font-semibold text-emerald-700 hover:text-emerald-900 underline shrink-0"
              >
                Clear Location Filter
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="space-y-0.5">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  Outside Direct Delivery Coverage Area
                </div>
                <p className="text-amber-800">
                  No verified vendors currently provide direct delivery to{' '}
                  <strong>
                    {searchResult.locationCoverage.postalCode || searchResult.locationCoverage.city}
                  </strong>
                  . Supported sample zones include <strong>Springfield (62701, 62702, 62704)</strong> and{' '}
                  <strong>Chicago (60601, 60607)</strong>.
                </p>
              </div>
              <Link href="/marketplace" className="shrink-0">
                <Button size="sm" variant="outline" className="text-xs bg-white">
                  Show Full Catalog
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <Suspense fallback={<div className="h-20 animate-pulse bg-slate-50 rounded-xl" />}>
            <SearchFilters
              categories={categories || []}
              vendors={vendors || []}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {searchResult.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {searchResult.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        /* Empty Results State */
        <Card className="border-slate-200 py-16 text-center">
          <CardContent className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <PackageOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900">No Grocery Products Found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                No active listings match your current filters. Try expanding your search term, clearing price bounds, or switching aisles.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/marketplace">
                <Button size="sm" variant="outline">
                  Clear All Filters & Show Full Catalog
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination Controls */}
      {searchResult.totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Page <span className="font-semibold text-slate-900">{searchResult.page}</span> of{' '}
            <span className="font-semibold text-slate-900">{searchResult.totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            {searchResult.page > 1 ? (
              <Link
                href={`/marketplace?${new URLSearchParams({
                  ...Object.fromEntries(
                    Object.entries(rawFilters).filter(([_, v]) => v !== undefined && v !== '')
                  ),
                  page: String(searchResult.page - 1),
                }).toString()}`}
              >
                <Button size="sm" variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="outline" disabled>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
            )}

            {searchResult.page < searchResult.totalPages ? (
              <Link
                href={`/marketplace?${new URLSearchParams({
                  ...Object.fromEntries(
                    Object.entries(rawFilters).filter(([_, v]) => v !== undefined && v !== '')
                  ),
                  page: String(searchResult.page + 1),
                }).toString()}`}
              >
                <Button size="sm" variant="outline">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Button size="sm" variant="outline" disabled>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
