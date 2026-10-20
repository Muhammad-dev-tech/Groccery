import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';
import { getPublicEnv, getServiceRoleKey } from '@/lib/env';

/** Request-scoped client acting as the signed-in user (RLS applies). */
export async function createClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/**
 * Service-role client that BYPASSES RLS. Server-only. Use only after an explicit
 * server-side authorization check, and never with user-controlled filters alone.
 */
export function createAdminClient() {
  const { supabaseUrl } = getPublicEnv();
  return createSupabaseClient<Database>(supabaseUrl, getServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
