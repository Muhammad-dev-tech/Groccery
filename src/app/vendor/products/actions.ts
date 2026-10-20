'use server';

import { createClient } from '@/lib/supabase/server';
import { productSchema, updateProductSchema } from '@/lib/validations/product';
import { revalidatePath } from 'next/cache';

export interface ProductActionResult {
  success: boolean;
  message?: string;
  error?: string;
  productId?: string;
}

/**
 * Creates a new grocery product.
 * Enforces that only approved vendor stores can publish products.
 */
export async function createProductAction(formData: FormData): Promise<ProductActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  // 1. Verify caller owns a store and check approval status
  const { data: store, error: storeError } = await supabase
    .from('vendor_stores')
    .select('id, status')
    .eq('owner_id', user.id)
    .single();

  if (storeError || !store) {
    return { success: false, error: 'No vendor store found for this account.' };
  }

  if (store.status !== 'approved') {
    return {
      success: false,
      error: `Store status is '${store.status}'. Only approved vendors can create or publish products.`,
    };
  }

  // 2. Parse and validate payload
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    price: formData.get('price'),
    currency: formData.get('currency') || 'USD',
    packageQuantity: formData.get('packageQuantity'),
    unitOfMeasurement: formData.get('unitOfMeasurement'),
    stockQuantity: formData.get('stockQuantity'),
    isAvailable: formData.get('isAvailable') === 'true' || formData.get('isAvailable') === 'on',
    imageUrl: formData.get('imageUrl') || null,
  };

  const parsed = productSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid product data.',
    };
  }

  // 3. Insert product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      vendor_id: store.id,
      category_id: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      currency: parsed.data.currency,
      package_quantity: parsed.data.packageQuantity,
      unit_of_measurement: parsed.data.unitOfMeasurement,
      stock_quantity: parsed.data.stockQuantity,
      is_available: parsed.data.isAvailable,
      is_archived: false,
    })
    .select('id')
    .single();

  if (productError || !product) {
    return {
      success: false,
      error: `Failed to create product: ${productError?.message || 'Unknown database error'}`,
    };
  }

  // 4. Insert image if provided
  if (parsed.data.imageUrl) {
    await supabase.from('product_images').insert({
      product_id: product.id,
      image_url: parsed.data.imageUrl,
      is_primary: true,
    });
  }

  revalidatePath('/vendor/products');
  revalidatePath('/vendor/dashboard');
  revalidatePath('/marketplace');

  return {
    success: true,
    message: 'Product created and published successfully!',
    productId: product.id,
  };
}

/**
 * Updates an existing grocery product.
 * Enforces ownership and approved store status.
 */
export async function updateProductAction(formData: FormData): Promise<ProductActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  const { data: store } = await supabase
    .from('vendor_stores')
    .select('id, status')
    .eq('owner_id', user.id)
    .single();

  if (!store || store.status !== 'approved') {
    return { success: false, error: 'Unauthorized: Store is not approved to manage products.' };
  }

  const rawData = {
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
    categoryId: formData.get('categoryId'),
    price: formData.get('price'),
    currency: formData.get('currency') || 'USD',
    packageQuantity: formData.get('packageQuantity'),
    unitOfMeasurement: formData.get('unitOfMeasurement'),
    stockQuantity: formData.get('stockQuantity'),
    isAvailable: formData.get('isAvailable') === 'true' || formData.get('isAvailable') === 'on',
    imageUrl: formData.get('imageUrl') || null,
  };

  const parsed = updateProductSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid product data.',
    };
  }

  // Verify product belongs to caller's store
  const { data: existingProduct } = await supabase
    .from('products')
    .select('id, vendor_id')
    .eq('id', parsed.data.id)
    .single();

  if (!existingProduct || existingProduct.vendor_id !== store.id) {
    return { success: false, error: 'Security Violation: Cannot modify another vendor’s product.' };
  }

  const { error: updateError } = await supabase
    .from('products')
    .update({
      category_id: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      currency: parsed.data.currency,
      package_quantity: parsed.data.packageQuantity,
      unit_of_measurement: parsed.data.unitOfMeasurement,
      stock_quantity: parsed.data.stockQuantity,
      is_available: parsed.data.isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.id);

  if (updateError) {
    return { success: false, error: `Update failed: ${updateError.message}` };
  }

  if (parsed.data.imageUrl) {
    // Check if primary image exists
    const { data: existingImg } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', parsed.data.id)
      .eq('is_primary', true)
      .maybeSingle();

    if (existingImg) {
      await supabase
        .from('product_images')
        .update({ image_url: parsed.data.imageUrl })
        .eq('id', existingImg.id);
    } else {
      await supabase.from('product_images').insert({
        product_id: parsed.data.id,
        image_url: parsed.data.imageUrl,
        is_primary: true,
      });
    }
  }

  revalidatePath('/vendor/products');
  revalidatePath('/vendor/dashboard');
  revalidatePath('/marketplace');

  return { success: true, message: 'Product updated successfully.' };
}

/**
 * Toggles product availability (in stock / out of stock toggle).
 */
export async function toggleProductAvailabilityAction(
  productId: string,
  newAvailability: boolean
): Promise<ProductActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized.' };

  const { data: store } = await supabase
    .from('vendor_stores')
    .select('id, status')
    .eq('owner_id', user.id)
    .single();

  if (!store || store.status !== 'approved') {
    return { success: false, error: 'Store not approved.' };
  }

  const { error } = await supabase
    .from('products')
    .update({ is_available: newAvailability })
    .eq('id', productId)
    .eq('vendor_id', store.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/vendor/products');
  return { success: true, message: `Product availability set to ${newAvailability ? 'Active' : 'Hidden'}.` };
}

/**
 * Soft-delete / Archive a product.
 */
export async function archiveProductAction(productId: string): Promise<ProductActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized.' };

  const { data: store } = await supabase
    .from('vendor_stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!store) return { success: false, error: 'Store not found.' };

  const { error } = await supabase
    .from('products')
    .update({ is_archived: true, is_available: false })
    .eq('id', productId)
    .eq('vendor_id', store.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/vendor/products');
  return { success: true, message: 'Product archived.' };
}
