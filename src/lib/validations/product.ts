import { z } from 'zod';

export const unitOfMeasureEnum = z.enum([
  'kg',
  'g',
  'l',
  'ml',
  'piece',
  'pack',
  'bundle',
]);

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(100, 'Product name cannot exceed 100 characters'),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
  categoryId: z.string().uuid('Please select a valid category'),
  price: z.coerce.number().min(0, 'Price cannot be negative').multipleOf(0.01, 'Price cannot have more than 2 decimal places'),
  currency: z.string().length(3, 'Currency must be a 3-letter code').default('USD'),
  packageQuantity: z.coerce.number().gt(0, 'Package quantity must be strictly greater than zero'),
  unitOfMeasurement: unitOfMeasureEnum,
  stockQuantity: z.coerce.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative'),
  isAvailable: z.boolean().default(true),
  imageUrl: z.string().url('Invalid image URL format').optional().or(z.literal('')).nullable(),
});

export const updateProductSchema = productSchema.extend({
  id: z.string().uuid('Invalid product ID'),
});

export const updateStoreStatusSchema = z.object({
  storeId: z.string().uuid('Invalid store ID'),
  newStatus: z.enum(['pending', 'approved', 'rejected', 'suspended']),
  reason: z.string().trim().min(5, 'A reason of at least 5 characters is required for audit compliance'),
});

export const updateStoreProfileSchema = z.object({
  name: z.string().trim().min(3, 'Store name must be at least 3 characters').max(60),
  description: z.string().trim().max(500).optional().nullable(),
  contactEmail: z.string().email('Invalid contact email'),
  contactPhone: z.string().trim().min(7, 'Invalid contact phone'),
  address: z.string().trim().min(5, 'Store address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State/region is required'),
  postalCode: z.string().trim().optional().nullable(),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')).nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateStoreStatusInput = z.infer<typeof updateStoreStatusSchema>;
export type UpdateStoreProfileInput = z.infer<typeof updateStoreProfileSchema>;
