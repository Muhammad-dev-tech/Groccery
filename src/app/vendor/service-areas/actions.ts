'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { serviceAreaSchema } from '@/lib/validations/location';

export interface ActionState {
  error?: string;
  success?: boolean;
}

/**
 * Adds a new geographic service zone / postal code for the authenticated vendor's store.
 */
export async function addServiceAreaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  // Retrieve vendor's store
  const { data: store, error: storeError } = await supabase
    .from('vendor_stores')
    .select('id, status')
    .eq('owner_id', user.id)
    .single();

  if (storeError || !store) {
    return { error: 'No active vendor store found for your profile.' };
  }

  if (store.status === 'suspended') {
    return { error: 'Suspended stores cannot modify service zones.' };
  }

  const raw = {
    city: formData.get('city'),
    state: formData.get('state'),
    zoneName: formData.get('zoneName'),
    postalCode: formData.get('postalCode') || null,
  };

  const parsed = serviceAreaSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || 'Invalid service area input.',
    };
  }

  const { city, state, zoneName, postalCode } = parsed.data;

  // Insert service area
  const { error: insertError } = await supabase
    .from('vendor_service_areas')
    .insert({
      vendor_id: store.id,
      city,
      state,
      zone_name: zoneName,
      postal_code: postalCode,
    });

  if (insertError) {
    if (insertError.code === '23505') {
      return {
        error: `A service zone named "${zoneName}" in ${city} already exists for your store.`,
      };
    }
    console.error('[addServiceAreaAction] insert error', insertError);
    return { error: 'Failed to add service area. Please try again.' };
  }

  revalidatePath('/vendor/service-areas');
  revalidatePath('/vendor/dashboard');
  revalidatePath('/marketplace');

  return { success: true };
}

/**
 * Deletes a configured service area from the authenticated vendor's store.
 */
export async function deleteServiceAreaAction(serviceAreaId: string): Promise<ActionState> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Authentication required.' };
  }

  // Find store
  const { data: store } = await supabase
    .from('vendor_stores')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    return { error: 'Vendor store not found.' };
  }

  // Delete matching service area ensuring store isolation
  const { error: deleteError } = await supabase
    .from('vendor_service_areas')
    .delete()
    .eq('id', serviceAreaId)
    .eq('vendor_id', store.id);

  if (deleteError) {
    console.error('[deleteServiceAreaAction] delete error', deleteError);
    return { error: 'Failed to delete service zone.' };
  }

  revalidatePath('/vendor/service-areas');
  revalidatePath('/marketplace');

  return { success: true };
}
