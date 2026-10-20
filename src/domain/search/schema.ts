import { z } from 'zod';
import type { NormalizedPriceResult } from '@/domain/units/normalizer';
import type { UnitOfMeasure } from '@/types/database.types';

export const searchFilterSchema = z.object({
  query: z.string().trim().optional(),
  categoryId: z.string().uuid().optional().or(z.literal('')),
  vendorId: z.string().uuid().optional().or(z.literal('')),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  inStockOnly: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === 'boolean') return val;
      if (val === 'true') return true;
      return false;
    }),
  sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type SearchFilterInput = z.infer<typeof searchFilterSchema>;

export interface SearchProductItem {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorCity: string;
  vendorState: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  packageQuantity: number;
  unitOfMeasurement: UnitOfMeasure;
  stockQuantity: number;
  isAvailable: boolean;
  createdAt: string;
  imageUrl: string | null;
  normalizedPrice: NormalizedPriceResult;
}

export interface SearchResult {
  products: SearchProductItem[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  filtersApplied: SearchFilterInput;
}
