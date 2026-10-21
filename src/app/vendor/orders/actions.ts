'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { updateOrderStatusSchema, type UpdateOrderStatusInput } from '@/lib/validations/order';

export async function updateVendorOrderStatusAction(input: UpdateOrderStatusInput) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  const parsed = updateOrderStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid status transition.' };
  }

  const { vendorOrderId, newStatus, note } = parsed.data;

  // 1. Verify caller owns the store for this suborder (or is admin)
  const { data: vOrder, error: voErr } = await supabase
    .from('vendor_orders')
    .select(`
      id,
      status,
      vendor_id,
      vendor:vendor_stores!vendor_orders_vendor_id_fkey(owner_id)
    `)
    .eq('id', vendorOrderId)
    .single();

  if (voErr || !vOrder) {
    return { error: 'Vendor order not found.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isStoreOwner = (vOrder.vendor as any)?.owner_id === user.id;
  const isAdmin = profile?.role === 'admin';

  if (!isStoreOwner && !isAdmin) {
    return { error: 'Unauthorized to update fulfillment status for this store.' };
  }

  const previousStatus = vOrder.status;

  // 2. Update status on vendor_orders
  const { error: updateErr } = await supabase
    .from('vendor_orders')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', vendorOrderId);

  if (updateErr) {
    return { error: 'Failed to update order status.' };
  }

  // 3. Log status history
  await supabase.from('order_status_history').insert({
    vendor_order_id: vendorOrderId,
    from_status: previousStatus,
    to_status: newStatus,
    changed_by: user.id,
    note: note || `Status updated to ${newStatus}`,
  });

  revalidatePath('/vendor/orders');
  revalidatePath('/orders');

  return { success: true };
}
