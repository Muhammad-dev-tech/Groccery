import { z } from 'zod';

/**
 * Environment validation and access helpers.
 *
 * NOTE: NEXT_PUBLIC_* values must be referenced literally (process.env.NEXT_PUBLIC_X)
 * so Next.js can inline them into the browser bundle.
 */
const publicSchema = z.object({
  supabaseUrl: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  supabaseAnonKey: z.string().min(20, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or invalid'),
  appUrl: z.string().url().default('http://localhost:3000'),
});

export type PublicEnv = z.infer<typeof publicSchema>;

export function getPublicEnv(): PublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-min-twenty-chars';
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
    'http://localhost:3000';

  const parsed = publicSchema.safeParse({
    supabaseUrl: url,
    supabaseAnonKey: anonKey,
    appUrl,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid public environment configuration: ${parsed.error.issues
        .map((i) => i.message)
        .join('; ')}. Copy .env.example to .env.local and fill in your Supabase project values.`
    );
  }
  return parsed.data;
}

/** Server-only. Never import from a Client Component. */
export function getServiceRoleKey(): string {
  if (typeof window !== 'undefined') {
    throw new Error('getServiceRoleKey() must never be called in the browser.');
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-role-key-min-twenty-chars';
  return key;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && !url.includes('placeholder') && key && !key.includes('placeholder'));
}
