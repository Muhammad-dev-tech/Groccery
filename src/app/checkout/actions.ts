'use server';

import { createClient } from '@/lib/supabase/server';
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/order';
import { multiplyMoney, sumMoney } from '@/domain/money/arithmetic';
import { revalidatePath } from 'next/cache';

export interface PlaceOrderResult {
  success?: boolean;
  error?: string;
  customerOrderId?: string;
}

export async function placeOrderAction(input: CheckoutInput): Promise<PlaceOrderResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be signed in to place an order.' };
  }

  // Validate input
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid checkout payload.' };
  }

  const { deliveryAddress, contactPhone, orderNotes, items } = parsed.data;

  // 1. Fetch live product records with vendor and category details
  const productIds = items.map((i) => i.productId);
  const { data: dbProducts, error: prodError } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      currency,
      package_quantity,
      unit_of_measurement,
      stock_quantity,
      is_available,
      is_archived,
      vendor:vendor_stores!products_vendor_id_fkey(id, name, status)
    `)
    .in('id', productIds);

  if (prodError || !dbProducts || dbProducts.length === 0) {
    return { error: 'Unable to verify items in your cart.' };
  }

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // 2. Validate availability and stock
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { error: `Product in your cart no longer exists.` };
    }
    if (product.is_archived || !product.is_available) {
      return { error: `"${product.name}" is no longer available for purchase.` };
    }
    if ((product.vendor as any)?.status !== 'approved') {
      return { error: `Store for "${product.name}" is not currently taking orders.` };
    }
    if (product.stock_quantity < item.quantity) {
      return {
        error: `Insufficient stock for "${product.name}". Only ${product.stock_quantity} left.`,
      };
    }
  }

  // 3. Partition items by vendor and compute accurate monetary values
  const vendorPartitionMap = new Map<
    string,
    {
      vendorId: string;
      items: Array<{
        product: any;
        quantity: number;
        lineTotal: number;
      }>;
      subtotal: number;
    }
  >();

  for (const item of items) {
    const p = productMap.get(item.productId)!;
    const vendorId = (p.vendor as any).id;
    const lineTotal = multiplyMoney(p.price, item.quantity);

    const existing = vendorPartitionMap.get(vendorId);
    if (existing) {
      existing.items.push({ product: p, quantity: item.quantity, lineTotal });
      existing.subtotal = sumMoney([existing.subtotal, lineTotal]);
    } else {
      vendorPartitionMap.set(vendorId, {
        vendorId,
        items: [{ product: p, quantity: item.quantity, lineTotal }],
        subtotal: lineTotal,
      });
    }
  }

  const partitions = Array.from(vendorPartitionMap.values());
  const grandTotal = sumMoney(partitions.map((p) => p.subtotal));

  // 4. Create Parent Customer Order
  const { data: customerOrder, error: orderErr } = await supabase
    .from('customer_orders')
    .insert({
      customer_id: user.id,
      total_amount: grandTotal,
      currency: 'USD',
      delivery_address: deliveryAddress,
      contact_phone: contactPhone,
      order_notes: orderNotes || null,
    })
    .select('id')
    .single();

  if (orderErr || !customerOrder) {
    console.error('[placeOrderAction] Customer order creation failed', orderErr);
    return { error: 'Failed to create order. Please try again.' };
  }

  const customerOrderId = customerOrder.id;

  // 5. Create Child Vendor Orders and Order Items
  for (const partition of partitions) {
    const { data: vendorOrder, error: vOrderErr } = await supabase
      .from('vendor_orders')
      .insert({
        customer_order_id: customerOrderId,
        vendor_id: partition.vendorId,
        subtotal: partition.subtotal,
        status: 'pending',
      })
      .select('id')
      .single();

    if (vOrderErr || !vendorOrder) {
      console.error('[placeOrderAction] Vendor order partition failed', vOrderErr);
      return { error: 'Failed to partition vendor orders.' };
    }

    // Insert Order Items snapshots
    const orderItemsRows = partition.items.map((it) => ({
      vendor_order_id: vendorOrder.id,
      product_id: it.product.id,
      product_name_snapshot: it.product.name,
      unit_price_snapshot: it.product.price,
      package_quantity_snapshot: it.product.package_quantity,
      unit_snapshot: it.product.unit_of_measurement,
      quantity: it.quantity,
      line_total: it.lineTotal,
    }));

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsRows);
    if (itemsErr) {
      console.error('[placeOrderAction] Order items insert failed', itemsErr);
    }

    // Insert Order Status History
    await supabase.from('order_status_history').insert({
      vendor_order_id: vendorOrder.id,
      from_status: null,
      to_status: 'pending',
      changed_by: user.id,
      note: 'Multi-vendor order placed by customer.',
    });

    // Deduct stock for purchased products
    for (const it of partition.items) {
      await supabase
        .from('products')
        .update({
          stock_quantity: Math.max(0, it.product.stock_quantity - it.quantity),
        })
        .eq('id', it.product.id);
    }
  }

  revalidatePath('/orders');
  revalidatePath('/vendor/orders');
  revalidatePath('/marketplace');

  return {
    success: true,
    customerOrderId,
  };
}
