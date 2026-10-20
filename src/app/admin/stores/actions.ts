'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { updateStoreStatusSchema } from '@/lib/validations/product';
import { revalidatePath } from 'next/cache';

export interface AdminStoreActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Admin action to approve, reject, suspend, or reinstate vendor stores.
 * Enforces admin caller authentication and writes an immutable audit log.
 */
export async function adminUpdateStoreStatusAction(
  formData: FormData
): Promise<AdminStoreActionResult> {
  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  // 1. Authoritative check that caller is an administrator
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .single();

  if (!callerProfile || callerProfile.role !== 'admin') {
    return {
      success: false,
      error: 'Security Violation: Only platform administrators can modify store approval status.',
    };
  }

  // 2. Validate input
  const rawData = {
    storeId: formData.get('storeId'),
    newStatus: formData.get('newStatus'),
    reason: formData.get('reason'),
  };

  const parsed = updateStoreStatusSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid moderation payload.',
    };
  }

  const adminClient = createAdminClient();

  // 3. Fetch current store status
  const { data: store, error: fetchError } = await adminClient
    .from('vendor_stores')
    .select('id, name, status, owner_id')
    .eq('id', parsed.data.storeId)
    .single();

  if (fetchError || !store) {
    return { success: false, error: 'Target store does not exist.' };
  }

  const previousStatus = store.status;

  // 4. Update store status
  const { error: updateError } = await adminClient
    .from('vendor_stores')
    .update({
      status: parsed.data.newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.storeId);

  if (updateError) {
    return { success: false, error: `Failed to update store status: ${updateError.message}` };
  }

  // If suspended or rejected, auto-hide active products to protect shoppers
  if (parsed.data.newStatus === 'suspended' || parsed.data.newStatus === 'rejected') {
    await adminClient
      .from('products')
      .update({ is_available: false })
      .eq('vendor_id', parsed.data.storeId);
  }

  // 5. Append-only audit logging
  await adminClient.from('admin_audit_logs').insert({
    admin_id: caller.id,
    action: `STORE_STATUS_CHANGE:${previousStatus}->${parsed.data.newStatus}`,
    target_entity: 'vendor_stores',
    target_id: parsed.data.storeId,
    details: {
      storeName: store.name,
      ownerId: store.owner_id,
      fromStatus: previousStatus,
      toStatus: parsed.data.newStatus,
      reason: parsed.data.reason,
      timestamp: new Date().toISOString(),
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/stores');
  revalidatePath('/vendor/dashboard');
  revalidatePath('/marketplace');

  return {
    success: true,
    message: `Store '${store.name}' status updated to '${parsed.data.newStatus}'.`,
  };
}
