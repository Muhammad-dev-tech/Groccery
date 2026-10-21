import { createClient } from '@/lib/supabase/server';
import { multiplyMoney, sumMoney } from '@/domain/money/arithmetic';
import type { UnitOfMeasure } from '@/types/database.types';

export interface ShoppingListItemRecord {
  id: string;
  listId: string;
  itemName: string;
  categoryId: string | null;
  targetQuantity: number;
  targetUnit: UnitOfMeasure;
}

export interface VendorItemMatch {
  productId: string;
  name: string;
  price: number;
  packageQuantity: number;
  unitOfMeasurement: UnitOfMeasure;
  stockQuantity: number;
  matchedPriceForTarget: number;
}

export interface VendorListAnalysis {
  vendorId: string;
  vendorName: string;
  vendorCity: string;
  fulfilledItemsCount: number;
  totalListItemsCount: number;
  fulfillmentPercentage: number;
  isFullyFulfilled: boolean;
  totalCost: number;
  missingItemNames: string[];
  matchedItems: Array<{
    listItemId: string;
    listItemName: string;
    targetQuantity: number;
    targetUnit: UnitOfMeasure;
    isAvailable: boolean;
    matchedProduct?: VendorItemMatch;
  }>;
}

export interface OptimalSplitItem {
  listItemId: string;
  listItemName: string;
  bestVendorId: string;
  bestVendorName: string;
  bestVendorCity: string;
  product: VendorItemMatch;
}

export interface SmartListCostAnalysisResult {
  listId: string;
  listTitle: string;
  totalItems: number;
  vendorAnalyses: VendorListAnalysis[];
  bestSingleVendor?: VendorListAnalysis;
  optimalSplit: {
    items: OptimalSplitItem[];
    totalCost: number;
    vendorsInvolvedCount: number;
    potentialSavingsVsSingleVendor?: number;
  };
}

/**
 * Analyzes a shopping list against all approved vendors.
 * Strictly guarantees that missing items are NEVER counted as zero cost.
 */
export async function analyzeShoppingListCost(
  listId: string
): Promise<SmartListCostAnalysisResult | null> {
  const supabase = await createClient();

  // 1. Fetch shopping list and its items
  const { data: list, error: listErr } = await supabase
    .from('shopping_lists')
    .select(`
      id,
      title,
      items:shopping_list_items(
        id,
        list_id,
        item_name,
        category_id,
        target_quantity,
        target_unit
      )
    `)
    .eq('id', listId)
    .single();

  if (listErr || !list) {
    return null;
  }

  const listItems = (list.items as any[]) || [];
  if (listItems.length === 0) {
    return {
      listId: list.id,
      listTitle: list.title,
      totalItems: 0,
      vendorAnalyses: [],
      optimalSplit: { items: [], totalCost: 0, vendorsInvolvedCount: 0 },
    };
  }

  // 2. Fetch all approved vendors
  const { data: approvedVendors } = await supabase
    .from('vendor_stores')
    .select('id, name, city')
    .eq('status', 'approved');

  if (!approvedVendors || approvedVendors.length === 0) {
    return null;
  }

  // 3. For each list item, query matching products across approved vendors
  // We match by text ilike OR category
  const itemMatchesByVendor = new Map<string, Map<string, VendorItemMatch>>();
  for (const v of approvedVendors) {
    itemMatchesByVendor.set(v.id, new Map());
  }

  for (const li of listItems) {
    let q = supabase
      .from('products')
      .select(`
        id,
        vendor_id,
        category_id,
        name,
        price,
        package_quantity,
        unit_of_measurement,
        stock_quantity,
        vendor:vendor_stores!products_vendor_id_fkey!inner(id, status)
      `)
      .eq('is_archived', false)
      .eq('is_available', true)
      .eq('vendor.status', 'approved');

    if (li.category_id) {
      q = q.eq('category_id', li.category_id);
    } else {
      q = q.ilike('name', `%${li.item_name}%`);
    }

    const { data: matchedProds } = await q;

    for (const prod of matchedProds || []) {
      const vendorMap = itemMatchesByVendor.get(prod.vendor_id);
      if (vendorMap && !vendorMap.has(li.id)) {
        // Calculate units needed
        const unitCost = prod.price; // baseline package cost
        vendorMap.set(li.id, {
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          packageQuantity: prod.package_quantity,
          unitOfMeasurement: prod.unit_of_measurement,
          stockQuantity: prod.stock_quantity,
          matchedPriceForTarget: unitCost,
        });
      }
    }
  }

  // 4. Construct per-vendor breakdown
  const vendorAnalyses: VendorListAnalysis[] = approvedVendors.map((v) => {
    const matches = itemMatchesByVendor.get(v.id) || new Map();
    const evaluatedItems: VendorListAnalysis['matchedItems'] = [];
    const missingItemNames: string[] = [];
    const itemSubtotals: number[] = [];

    for (const li of listItems) {
      const match = matches.get(li.id);
      if (match) {
        evaluatedItems.push({
          listItemId: li.id,
          listItemName: li.item_name,
          targetQuantity: li.target_quantity,
          targetUnit: li.target_unit,
          isAvailable: true,
          matchedProduct: match,
        });
        itemSubtotals.push(match.matchedPriceForTarget);
      } else {
        evaluatedItems.push({
          listItemId: li.id,
          listItemName: li.item_name,
          targetQuantity: li.target_quantity,
          targetUnit: li.target_unit,
          isAvailable: false,
        });
        missingItemNames.push(li.item_name);
      }
    }

    const totalCost = sumMoney(itemSubtotals);
    const fulfilledItemsCount = evaluatedItems.filter((i) => i.isAvailable).length;
    const fulfillmentPercentage = Math.round(
      (fulfilledItemsCount / listItems.length) * 100
    );

    return {
      vendorId: v.id,
      vendorName: v.name,
      vendorCity: v.city,
      fulfilledItemsCount,
      totalListItemsCount: listItems.length,
      fulfillmentPercentage,
      isFullyFulfilled: fulfilledItemsCount === listItems.length,
      totalCost,
      missingItemNames,
      matchedItems: evaluatedItems,
    };
  });

  // Sort vendors by fulfillment rate desc, then total cost asc
  vendorAnalyses.sort((a, b) => {
    if (b.fulfilledItemsCount !== a.fulfilledItemsCount) {
      return b.fulfilledItemsCount - a.fulfilledItemsCount;
    }
    return a.totalCost - b.totalCost;
  });

  // Single Best Vendor: lowest cost with maximum fulfillment
  const bestSingleVendor = vendorAnalyses.length > 0 ? vendorAnalyses[0] : undefined;

  // 5. Compute Optimal Multi-Vendor Split (finding lowest price for each item across vendors)
  const optimalSplitItems: OptimalSplitItem[] = [];
  const optimalPrices: number[] = [];
  const participatingVendors = new Set<string>();

  for (const li of listItems) {
    let lowestItemPrice = Infinity;
    let bestMatch: OptimalSplitItem | null = null;

    for (const v of approvedVendors) {
      const match = itemMatchesByVendor.get(v.id)?.get(li.id);
      if (match && match.matchedPriceForTarget < lowestItemPrice) {
        lowestItemPrice = match.matchedPriceForTarget;
        bestMatch = {
          listItemId: li.id,
          listItemName: li.item_name,
          bestVendorId: v.id,
          bestVendorName: v.name,
          bestVendorCity: v.city,
          product: match,
        };
      }
    }

    if (bestMatch) {
      optimalSplitItems.push(bestMatch);
      optimalPrices.push(bestMatch.product.matchedPriceForTarget);
      participatingVendors.add(bestMatch.bestVendorId);
    }
  }

  const optimalTotalCost = sumMoney(optimalPrices);
  let potentialSavingsVsSingleVendor: number | undefined = undefined;

  if (bestSingleVendor && bestSingleVendor.isFullyFulfilled && optimalTotalCost > 0) {
    potentialSavingsVsSingleVendor = Math.max(
      0,
      Math.round((bestSingleVendor.totalCost - optimalTotalCost) * 100) / 100
    );
  }

  return {
    listId: list.id,
    listTitle: list.title,
    totalItems: listItems.length,
    vendorAnalyses,
    bestSingleVendor,
    optimalSplit: {
      items: optimalSplitItems,
      totalCost: optimalTotalCost,
      vendorsInvolvedCount: participatingVendors.size,
      potentialSavingsVsSingleVendor,
    },
  };
}
