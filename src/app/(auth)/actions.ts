'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import {
  loginSchema,
  registerCustomerSchema,
  registerVendorSchema,
  onboardStoreSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  assignAdminRoleSchema,
} from '@/lib/validations/auth';
import { revalidatePath } from 'next/cache';
import { getPublicEnv } from '@/lib/env';
import type { Profile } from '@/types/database.types';

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  redirectTo?: string;
}

/**
 * Sign In with Email & Password
 */
export async function signInAction(formData: FormData): Promise<ActionResponse> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid input values.',
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  // Retrieve user profile to determine landing dashboard
  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()) as { data: Profile | null; error: any };

  let destination = '/';
  if (profile?.role === 'admin') {
    destination = '/admin';
  } else if (profile?.role === 'vendor') {
    destination = '/vendor/dashboard';
  } else {
    destination = '/account';
  }

  return {
    success: true,
    message: 'Signed in successfully.',
    redirectTo: destination,
  };
}

/**
 * Register as Customer
 * Strictly enforces that public users can NEVER set their role to 'admin'
 */
export async function registerCustomerAction(formData: FormData): Promise<ActionResponse> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = registerCustomerSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid registration details.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getPublicEnv().appUrl}/auth/confirm?next=/account`,
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone || null,
        role: 'customer', // HARDCODED server-side: public cannot claim admin or other privileged roles
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Account created successfully! Check your email to verify your address.',
    redirectTo: '/login?registered=true',
  };
}

/**
 * Register as Vendor
 * Supports both existing signed-in customers onboarding a store and new guest vendor registration
 */
export async function registerVendorAction(formData: FormData): Promise<ActionResponse> {
  const rawData = Object.fromEntries(formData.entries());
  const supabase = await createClient();
  const adminClient = createAdminClient();

  let {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // If session cookie wasn't detected by createClient, but client passed userId from authenticated browser session:
  if (!currentUser && rawData.userId) {
    const { data: userData } = await adminClient.auth.admin.getUserById(String(rawData.userId));
    if (userData?.user) {
      currentUser = userData.user;
    }
  }

  let targetUserId: string;
  let contactEmail: string;

  if (currentUser) {
    // Current user is already signed in! Validate store details only.
    const parsed = onboardStoreSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || 'Invalid store details.',
      };
    }

    targetUserId = currentUser.id;
    contactEmail = currentUser.email || String(rawData.email || '');

    // Check if store already exists for this owner
    const { data: existingStore } = await adminClient
      .from('vendor_stores')
      .select('id, name')
      .eq('owner_id', targetUserId)
      .maybeSingle();

    if (existingStore) {
      // Ensure user profile role is vendor
      await adminClient.from('profiles').update({ role: 'vendor' }).eq('id', targetUserId);
      revalidatePath('/vendor/dashboard');
      revalidatePath('/account');
      return {
        success: true,
        message: 'Your store is already active!',
        redirectTo: '/vendor/dashboard',
      };
    }

    const baseSlug = parsed.data.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 48);

    const { error: storeError } = await adminClient.from('vendor_stores').insert({
      owner_id: targetUserId,
      name: parsed.data.storeName,
      slug: `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`,
      description: parsed.data.storeDescription || null,
      contact_email: contactEmail,
      contact_phone: parsed.data.contactPhone,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      postal_code: parsed.data.postalCode || null,
      status: 'approved',
    });

    if (storeError) {
      const duplicateName = storeError.code === '23505';
      return {
        success: false,
        error: duplicateName
          ? 'A store with this name already exists. Please choose another name.'
          : 'Could not create your store: ' + storeError.message,
      };
    }

    // Upgrade user profile role to vendor
    await adminClient.from('profiles').update({ role: 'vendor' }).eq('id', targetUserId);
    revalidatePath('/vendor/dashboard');
    revalidatePath('/account');

    return {
      success: true,
      message: 'Store registered and approved successfully!',
      redirectTo: '/vendor/dashboard',
    };
  }

  // Otherwise, user is a guest creating a new user account + store
  const parsed = registerVendorSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid vendor details.',
    };
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${getPublicEnv().appUrl}/auth/confirm?next=/vendor/dashboard`,
      data: {
        full_name: parsed.data.fullName,
        role: 'vendor',
      },
    },
  });

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message || 'Failed to register vendor account.',
    };
  }

  if (!authData.user.identities || authData.user.identities.length === 0) {
    return { success: false, error: 'An account with this email already exists. Please sign in first, then register your store.' };
  }

  targetUserId = authData.user.id;
  contactEmail = parsed.data.email;

  const baseSlug = parsed.data.storeName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 48);

  const { error: storeError } = await adminClient.from('vendor_stores').insert({
    owner_id: targetUserId,
    name: parsed.data.storeName,
    slug: `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`,
    description: parsed.data.storeDescription || null,
    contact_email: contactEmail,
    contact_phone: parsed.data.contactPhone,
    address: parsed.data.address,
    city: parsed.data.city,
    state: parsed.data.state,
    postal_code: parsed.data.postalCode || null,
    status: 'approved',
  });

  if (storeError) {
    await adminClient.auth.admin.deleteUser(targetUserId);
    const duplicateName = storeError.code === '23505';
    return {
      success: false,
      error: duplicateName
        ? 'A store with this name already exists. Please choose another name.'
        : 'Could not create your store: ' + storeError.message,
    };
  }

  return {
    success: true,
    message: 'Store registered successfully! Redirecting to Vendor Hub...',
    redirectTo: '/vendor/dashboard',
  };
}

/**
 * Request Password Reset
 */
export async function resetPasswordAction(formData: FormData): Promise<ActionResponse> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = resetPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid email address.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getPublicEnv().appUrl}/auth/confirm?next=/reset-password/confirm`,
  });

  if (error) {
    // Log server-side only; respond generically to avoid revealing which emails are registered.
    console.error('[resetPassword] request failed', { status: error.status });
  }

  return {
    success: true,
    message: 'If an account exists for that email, password reset instructions have been sent.',
  };
}

/**
 * Update Password
 */
export async function updatePasswordAction(formData: FormData): Promise<ActionResponse> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = updatePasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Invalid password details.',
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
    message: 'Password updated successfully.',
    redirectTo: '/login',
  };
}

/**
 * Sign Out Action
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}

/**
 * Protected Administrator Privilege Assignment Process
 * Strictly requires the caller to already be an authenticated administrator
 */
export async function assignAdminRoleAction(formData: FormData): Promise<ActionResponse> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = assignAdminRoleSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || 'Validation failed for admin assignment.',
    };
  }

  const supabase = await createClient();
  const {
    data: { user: caller },
  } = await supabase.auth.getUser();

  if (!caller) {
    return { success: false, error: 'Unauthorized: Authentication required.' };
  }

  // 1. Verify caller is an active admin
  const { data: callerProfile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', caller.id)
    .single()) as { data: Profile | null; error: any };

  if (callerProfile?.role !== 'admin') {
    return {
      success: false,
      error: 'Security Violation: Only existing administrators can assign administrative privileges.',
    };
  }

  // 2. Perform role update via elevated Admin Client
  const adminClient = createAdminClient();
  const { error: updateError } = await adminClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', parsed.data.targetUserId);

  if (updateError) {
    return {
      success: false,
      error: `Failed to promote user: ${updateError.message}`,
    };
  }

  // 3. Write structured audit trail
  await adminClient.from('admin_audit_logs').insert({
    admin_id: caller.id,
    action: 'ASSIGN_ADMIN_PRIVILEGES',
    target_entity: 'profiles',
    target_id: parsed.data.targetUserId,
    details: {
      reason: parsed.data.reason,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    success: true,
    message: 'User successfully promoted to administrator. Audit log entry recorded.',
  };
}
