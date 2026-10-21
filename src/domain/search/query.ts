import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { getDemoProducts } from './demoData';
import { calculateNormalizedPrice } from '@/domain/units/normalizer';
import { evaluateLocationCoverage } from '@/domain/location/service';
import {
  searchFilterSchema,
  type SearchFilterInput,
  type SearchProductItem,
  type SearchResult,
} from './schema';

export {
  searchFilterSchema,
  type SearchFilterInput,
  type SearchProductItem,
  type SearchResult,
};

/**
 * Executes marketplace-wide search querying real PostgreSQL records.
 * Only returns active products from approved vendors.
 * If location criteria (postal code or city) are provided, only products from
 * vendors serving that exact geographic zone are returned.
 */
export async function searchMarketplaceProducts(
  rawFilters: Partial<SearchFilterInput>
): Promise<SearchResult> {
  const parsed = searchFilterSchema.parse(rawFilters);

  if (!isSupabaseConfigured()) {
    return getDemoProducts(parsed);
  }

  const supabase = await createClient();

  const isLocationFiltered = Boolean(parsed.postalCode || parsed.city);
  let locationCoverage = undefined;

  if (isLocationFiltered) {
    const coverage = await evaluateLocationCoverage({
      postalCode: parsed.postalCode,
      city: parsed.city,
    });

    locationCoverage = {
      isFilteredByLocation: true,
      isCovered: coverage.isCovered,
      postalCode: parsed.postalCode,
      city: parsed.city,
      totalApprovedVendorsInZone: coverage.totalApprovedVendorsInZone,
    };

    if (!coverage.isCovered || coverage.vendorIds.length === 0) {
      return {
        products: [],
        totalCount: 0,
        page: parsed.page,
        limit: parsed.limit,
        totalPages: 0,
        filtersApplied: parsed,
        locationCoverage,
      };
    }
  }

  const offset = (parsed.page - 1) * parsed.limit;

  // Build Supabase Query
  let query = supabase
    .from('products')
    .select(
      `
      id,
      vendor_id,
      category_id,
      name,
      description,
      price,
      currency,
      package_quantity,
      unit_of_measurement,
      stock_quantity,
      is_available,
      created_at,
      vendor:vendor_stores!products_vendor_id_fkey(
        id,
        name,
        city,
        state,
        status,
        vendor_service_areas(zone_name, postal_code)
      ),
      category:categories!products_category_id_fkey(id, name, icon),
      images:product_images(image_url, is_primary)
      `,
      { count: 'exact' }
    )
    .eq('is_archived', false)
    .eq('is_available', true)
    .eq('vendor.status', 'approved');

  if (isLocationFiltered && locationCoverage?.isCovered) {
    const coverage = await evaluateLocationCoverage({
      postalCode: parsed.postalCode,
      city: parsed.city,
    });
    query = query.in('vendor_id', coverage.vendorIds);
  }

  // Text search on product name or description
  if (parsed.query) {
    query = query.or(`name.ilike.%${parsed.query}%,description.ilike.%${parsed.query}%`);
  }

  // Category filter
  if (parsed.categoryId) {
    query = query.eq('category_id', parsed.categoryId);
  }

  // Vendor filter
  if (parsed.vendorId) {
    query = query.eq('vendor_id', parsed.vendorId);
  }

  // Min price filter
  if (parsed.minPrice !== undefined && parsed.minPrice > 0) {
    query = query.gte('price', parsed.minPrice);
  }

  // Max price filter
  if (parsed.maxPrice !== undefined && parsed.maxPrice > 0) {
    query = query.lte('price', parsed.maxPrice);
  }

  // In-stock availability filter
  if (parsed.inStockOnly) {
    query = query.gt('stock_quantity', 0);
  }

  // Sorting
  switch (parsed.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'relevance':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Pagination range
  query = query.range(offset, offset + parsed.limit - 1);

  const { data, count, error } = await query;

  if (error) {
    if (isSupabaseConfigured()) {
      console.error('[searchMarketplaceProducts] query failed', error);
    }
    return getDemoProducts(parsed);
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / parsed.limit);

  // Map and calculate normalized prices
  const products: SearchProductItem[] = (data || [])
    .filter((row: any) => row.vendor && row.vendor.status === 'approved')
    .map((row: any) => {
      const primaryImage =
        row.images?.find((img: any) => img.is_primary)?.image_url ||
        row.images?.[0]?.image_url ||
        null;

      const normalizedPrice = calculateNormalizedPrice(
        row.price,
        row.package_quantity,
        row.unit_of_measurement
      );

      const serviceZones = (row.vendor.vendor_service_areas || []).map(
        (z: any) => `${z.zone_name}${z.postal_code ? ` (${z.postal_code})` : ''}`
      );

      return {
        id: row.id,
        vendorId: row.vendor_id,
        vendorName: row.vendor.name,
        vendorCity: row.vendor.city,
        vendorState: row.vendor.state,
        categoryId: row.category_id,
        categoryName: row.category?.name || 'General',
        categoryIcon: row.category?.icon || null,
        name: row.name,
        description: row.description,
        price: row.price,
        currency: row.currency,
        packageQuantity: row.package_quantity,
        unitOfMeasurement: row.unit_of_measurement,
        stockQuantity: row.stock_quantity,
        isAvailable: row.is_available,
        createdAt: row.created_at,
        imageUrl: primaryImage,
        normalizedPrice,
        serviceZones,
        servesSelectedLocation: isLocationFiltered ? true : undefined,
      };
    });

  return {
    products,
    totalCount,
    page: parsed.page,
    limit: parsed.limit,
    totalPages,
    filtersApplied: parsed,
    locationCoverage,
  };
}
