import { compareProductAcrossVendors } from '@/domain/pricing/comparison';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Scale,
  Store,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  AlertTriangle,
  TrendingDown,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Cross-Vendor Price Comparison — FreshGrocer',
  description: 'Compare equivalent grocery products across independent vendors with transparent unit price normalization.',
};

export default async function ProductComparisonPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string }>;
}) {
  const { productId } = await searchParams;

  if (!productId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">No Product Selected for Comparison</h2>
        <p className="text-xs text-slate-500">
          Select an item from the marketplace catalog to compare prices across local independent stores.
        </p>
        <Link href="/marketplace">
          <Button size="sm">Browse Marketplace</Button>
        </Link>
      </div>
    );
  }

  const comparison = await compareProductAcrossVendors(productId);

  if (!comparison) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested product could not be located or may belong to an unapproved vendor store.
        </p>
        <Link href="/marketplace">
          <Button size="sm">Return to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const { targetProduct, equivalentProducts, bestValueVendorName, lowestNormalizedPriceFormatted } = comparison;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Navigation & Header */}
      <div className="space-y-3">
        <Link
          href="/marketplace"
          className="inline-flex items-center text-xs font-semibold text-brand-700 hover:underline gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Scale className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Cross-Vendor Price Comparison
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Aisle: <span className="font-semibold text-slate-700">{targetProduct.categoryName}</span> · Dimension-safe unit normalization across approved merchants.
            </p>
          </div>

          {bestValueVendorName && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Best Value per {targetProduct.normalizedPrice.baseUnit}:</span>
                <span>{bestValueVendorName} ({lowestNormalizedPriceFormatted})</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Target Product Summary Card */}
      <Card className="border-brand-200 bg-brand-50/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              {targetProduct.imageUrl ? (
                <img
                  src={targetProduct.imageUrl}
                  alt={targetProduct.name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-brand-100/60 border border-brand-200 flex items-center justify-center text-brand-800 font-black text-xl shrink-0">
                  {targetProduct.name.charAt(0)}
                </div>
              )}
              <div>
                <Badge variant="brand" className="mb-1">Selected Product</Badge>
                <CardTitle className="text-lg text-slate-900">{targetProduct.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                  <Store className="w-3.5 h-3.5 text-slate-400" />
                  <span>{targetProduct.vendorName}</span>
                  <span className="text-slate-300">·</span>
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{targetProduct.vendorCity}, {targetProduct.vendorState}</span>
                </div>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:pl-6 space-y-1">
              <div className="text-2xl font-black text-slate-900">
                ${targetProduct.price.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500">
                Pack: {targetProduct.packageQuantity} {targetProduct.unitOfMeasurement}
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Scale className="w-3 h-3 text-emerald-700" />
                <span>{targetProduct.normalizedPrice.formattedComparison}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Equivalent Options from Other Approved Vendors */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Equivalent Products from Other Stores ({equivalentProducts.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Normalized against standard unit <span className="font-semibold text-slate-800">({targetProduct.normalizedPrice.baseUnit})</span> for transparent comparison.
          </p>
        </div>

        {equivalentProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equivalentProducts.map((cand) => (
              <Card
                key={cand.id}
                className={`transition-smooth ${
                  cand.isBestValue
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10'
                    : 'border-slate-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Store className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">{cand.vendorName}</span>
                    </div>
                    {cand.isBestValue && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" /> Best Value
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base text-slate-900 mt-1 line-clamp-1">
                    {cand.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{cand.vendorCity}, {cand.vendorState}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {/* Pricing Comparison Grid */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Listed Price:</span>
                      <span className="text-lg font-black text-slate-900">
                        ${cand.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Package Size:</span>
                      <span className="font-semibold text-slate-800">
                        {cand.packageQuantity} {cand.unitOfMeasurement}
                      </span>
                    </div>

                    {/* Normalized Comparison */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">Normalized Price:</span>
                      {cand.isComparable && cand.normalizedPrice ? (
                        <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {cand.normalizedPrice.formattedComparison}
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium">
                          N/A (Incompatible Unit)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Savings / Dimension Incompatibility Feedback */}
                  {cand.isComparable && cand.savingsPercentageVsTarget !== undefined && (
                    <div className="text-xs">
                      {cand.savingsPercentageVsTarget > 0 ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <TrendingDown className="w-4 h-4" />
                          <span>{cand.savingsPercentageVsTarget}% cheaper per {targetProduct.normalizedPrice.baseUnit}</span>
                        </div>
                      ) : cand.savingsPercentageVsTarget < 0 ? (
                        <div className="text-slate-500 font-medium">
                          {Math.abs(cand.savingsPercentageVsTarget)}% higher per {targetProduct.normalizedPrice.baseUnit}
                        </div>
                      ) : (
                        <div className="text-slate-500 font-medium">
                          Equivalent unit price to selected item
                        </div>
                      )}
                    </div>
                  )}

                  {!cand.isComparable && cand.incompatibilityReason && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{cand.incompatibilityReason}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12 text-center border-slate-200">
            <CardContent className="space-y-2">
              <Scale className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900">
                No Alternative Stores Carrying this Category
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Currently, {targetProduct.vendorName} is the sole approved vendor offering products in the {targetProduct.categoryName} aisle.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
