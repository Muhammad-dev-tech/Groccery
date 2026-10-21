import type { UnitOfMeasure } from '@/types/database.types';

export interface CartItem {
  productId: string;
  vendorId: string;
  vendorName: string;
  vendorCity: string;
  name: string;
  price: number;
  quantity: number;
  unitOfMeasurement: UnitOfMeasure;
  packageQuantity: number;
  imageUrl: string | null;
  stockQuantity: number;
}

export interface VendorCartPartition {
  vendorId: string;
  vendorName: string;
  vendorCity: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface CartSummary {
  partitions: VendorCartPartition[];
  totalItems: number;
  totalPrice: number;
  vendorCount: number;
}
