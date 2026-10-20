import { z } from 'zod';

/**
 * Normalizes postal code strings for consistent database indexing and comparison.
 * Strips superfluous spaces and converts to uppercase (e.g. " 62701 " -> "62701", "sw1a 1aa" -> "SW1A 1AA").
 */
export function normalizePostalCode(code?: string | null): string {
  if (!code) return '';
  return code.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Schema for vendors configuring geographical service/delivery zones.
 */
export const serviceAreaSchema = z.object({
  city: z
    .string()
    .trim()
    .min(2, 'City name must be at least 2 characters')
    .max(100, 'City name cannot exceed 100 characters'),
  state: z
    .string()
    .trim()
    .min(2, 'State or province must be at least 2 characters')
    .max(50, 'State cannot exceed 50 characters'),
  zoneName: z
    .string()
    .trim()
    .min(2, 'Zone / neighborhood name must be at least 2 characters')
    .max(100, 'Zone name cannot exceed 100 characters'),
  postalCode: z
    .string()
    .trim()
    .max(20, 'Postal code cannot exceed 20 characters')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? normalizePostalCode(val) : null)),
});

export type ServiceAreaInput = z.infer<typeof serviceAreaSchema>;

/**
 * Schema for customer location selection and search query filtering.
 */
export const locationFilterSchema = z.object({
  postalCode: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length > 0 ? normalizePostalCode(val) : undefined)),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
});

export type LocationFilterInput = z.infer<typeof locationFilterSchema>;
