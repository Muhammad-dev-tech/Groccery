import { createClient } from '@/lib/supabase/server';
import {
  calculateNormalizedPrice,
  areUnitsComparable,
  type NormalizedPriceResult,
} from '@/domain/units/normalizer';
import type { UnitOfMeasure } from '@/types/database.types';

export interface ComparisonCandidate {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCity: string;
  vendorState: string;
  name: string;
  price: number;
  currency: string;
  packageQuantity: number;
  unitOfMeasurement: UnitOfMeasure;
  stockQuantity: number;
  isAvailable: boolean;
  imageUrl: string | null;
  isComparable: boolean;
  incompatibilityReason?: string;
  normalizedPrice?: NormalizedPriceResult;
  isBestValue?: boolean;
  savingsPercentageVsTarget?: number;
}

export interface ProductComparisonResult {
  targetProduct: {
    id: string;
    name: string;
    vendorName: string;
    vendorCity: string;
    vendorState: string;
    categoryName: string;
    price: number;
    currency: string;
    packageQuantity: number;
    unitOfMeasurement: UnitOfMeasure;
    stockQuantity: number;
    imageUrl: string | null;
    normalizedPrice: NormalizedPriceResult;
  };
  equivalentProducts: ComparisonCandidate[];
  bestValueVendorName?: string;
  lowestNormalizedPriceFormatted?: string;
  totalVendorsOfferingCategory: number;
}

/**
 * Finds equivalent products across independent vendors and calculates
 * verified, dimension-safe normalized unit price comparisons.
 */
export async function compareProductAcrossVendors(
  targetProductId: string
): Promise<ProductComparisonResult | null> {
  const supabase = await createClient();

  // 1. Fetch target product with category and vendor
  const { data: target, error: targetError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      currency,
      package_quantity,
      unit_of_measurement,
      stock_quantity,
      category_id,
      vendor:vendor_stores!products_vendor_id_fkey(name, city, state),
      category:categories!products_category_id_fkey(name),
      images:product_images(image_url, is_primary)
    `)
    .eq('id', targetProductId)
    .single();

  if (targetError || !target || !target.vendor) {
    return null;
  }

  const targetImageUrl =
    target.images?.find((img: any) => img.is_primary)?.image_url ||
    target.images?.[0]?.image_url ||
    null;

  const targetNormalized = calculateNormalizedPrice(
    target.price,
    target.package_quantity,
    target.unit_of_measurement
  );

  // 2. Fetch candidates from same category across approved vendors
  const { data: candidates } = await supabase
    .from('products')
    .select(`
      id,
      vendor_id,
      name,
      price,
      currency,
      package_quantity,
      unit_of_measurement,
      stock_quantity,
      is_available,
      vendor:vendor_stores!products_vendor_id_fkey(id, name, city, state, status),
      images:product_images(image_url, is_primary)
    `)
    .eq('category_id', target.category_id)
    .eq('is_archived', false)
    .eq('is_available', true)
    .neq('id', target.id)
    .eq('vendor.status', 'approved')
    .limit(20);

  let lowestPricePerBaseUnit = targetNormalized.normalizedPricePerBaseUnit;
  let bestValueVendor = target.vendor.name;

  const evaluatedCandidates: ComparisonCandidate[] = (candidates || [])
    .filter((c: any) => c.vendor && c.vendor.status === 'approved')
    .map((c: any) => {
      const img =
        c.images?.find((i: any) => i.is_primary)?.image_url ||
        c.images?.[0]?.image_url ||
        null;

      // Check dimension compatibility
      const comparable = areUnitsComparable(
        target.unit_of_measurement,
        c.unit_of_measurement
      );

      if (!comparable) {
        return {
          id: c.id,
          vendorId: c.vendor.id,
          vendorName: c.vendor.name,
          vendorCity: c.vendor.city,
          vendorState: c.vendor.state,
          name: c.name,
          price: c.price,
          currency: c.currency,
          packageQuantity: c.package_quantity,
          unitOfMeasurement: c.unit_of_measurement,
          stockQuantity: c.stock_quantity,
          isAvailable: c.is_available,
          imageUrl: img,
          isComparable: false,
          incompatibilityReason: `Incompatible units (${target.unit_of_measurement} vs ${c.unit_of_measurement}): mass and volume cannot be compared directly.`,
        };
      }

      const normalized = calculateNormalizedPrice(
        c.price,
        c.package_quantity,
        c.unit_of_measurement
      );

      if (normalized.normalizedPricePerBaseUnit < lowestPricePerBaseUnit) {
        lowestPricePerBaseUnit = normalized.normalizedPricePerBaseUnit;
        bestValueVendor = c.vendor.name;
      }

      // Calculate percentage savings compared to target product's unit price
      const diff =
        ((targetNormalized.normalizedPricePerBaseUnit - normalized.normalizedPricePerBaseUnit) /
          targetNormalized.normalizedPricePerBaseUnit) *
        100;

      return {
        id: c.id,
        vendorId: c.vendor.id,
        vendorName: c.vendor.name,
        vendorCity: c.vendor.city,
        vendorState: c.vendor.state,
        name: c.name,
        price: c.price,
        currency: c.currency,
        packageQuantity: c.package_quantity,
        unitOfMeasurement: c.unit_of_measurement,
        stockQuantity: c.stock_quantity,
        isAvailable: c.is_available,
        imageUrl: img,
        isComparable: true,
        normalizedPrice: normalized,
        savingsPercentageVsTarget: Math.round(diff * 10) / 10,
      };
    });

  // Flag best value among all comparable candidates
  const finalCandidates = evaluatedCandidates.map((c) => ({
    ...c,
    isBestValue:
      c.isComparable &&
      c.normalizedPrice?.normalizedPricePerBaseUnit === lowestPricePerBaseUnit,
  }));

  return {
    targetProduct: {
      id: target.id,
      name: target.name,
      vendorName: target.vendor.name,
      vendorCity: target.vendor.city,
      vendorState: target.vendor.state,
      categoryName: target.category?.name || 'General',
      price: target.price,
      currency: target.currency,
      packageQuantity: target.package_quantity,
      unitOfMeasurement: target.unit_of_measurement,
      stockQuantity: target.stock_quantity,
      imageUrl: targetImageUrl,
      normalizedPrice: targetNormalized,
    },
    equivalentProducts: finalCandidates,
    bestValueVendorName: bestValueVendor,
    lowestNormalizedPriceFormatted: `$${lowestPricePerBaseUnit.toFixed(2)} / ${targetNormalized.baseUnit}`,
    totalVendorsOfferingCategory: finalCandidates.length + 1,
  };
}
