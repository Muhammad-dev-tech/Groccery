import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';
import { getPublicEnv } from '@/lib/env';

export function createClient() {
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
