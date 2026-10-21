import { z } from 'zod';

export const checkoutItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const checkoutSchema = z.object({
  deliveryAddress: z
    .string()
    .trim()
    .min(5, 'Delivery address must be at least 5 characters')
    .max(200, 'Delivery address cannot exceed 200 characters'),
  contactPhone: z
    .string()
    .trim()
    .min(7, 'Please provide a valid phone number')
    .max(25, 'Phone number cannot exceed 25 characters'),
  orderNotes: z.string().trim().max(500, 'Notes cannot exceed 500 characters').optional().nullable(),
  items: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty for checkout'),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const updateOrderStatusSchema = z.object({
  vendorOrderId: z.string().uuid('Invalid vendor order ID'),
  newStatus: z.enum([
    'pending',
    'accepted',
    'preparing',
    'ready',
    'completed',
    'cancelled',
    'rejected',
  ]),
  note: z.string().trim().max(300).optional(),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
