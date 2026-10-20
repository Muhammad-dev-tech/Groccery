import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database, UserRole } from '@/types/database.types';
import { getPublicEnv } from '@/lib/env';

/** Routes reachable without signing in even though they live under a protected prefix. */
const PUBLIC_EXCEPTIONS = ['/vendor/register'];

const ROLE_PREFIXES: { prefix: string; allowed: UserRole[] }[] = [
  { prefix: '/admin', allowed: ['admin'] },
  { prefix: '/vendor', allowed: ['vendor', 'admin'] },
];

const AUTH_ONLY_PREFIXES = ['/account', '/checkout', '/orders', '/saved-lists'];

function redirectTo(request: NextRequest, pathname: string, withReturn = false) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = '';
  if (withReturn) url.searchParams.set('redirectTo', request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Do not run code between createServerClient and getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  if (PUBLIC_EXCEPTIONS.some((p) => pathname === p)) return supabaseResponse;

  const roleRule = ROLE_PREFIXES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  if (roleRule) {
    if (!user) return redirectTo(request, '/login', true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !roleRule.allowed.includes(profile.role)) {
      return redirectTo(request, '/');
    }
    return supabaseResponse;
  }

  if (AUTH_ONLY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) && !user) {
    return redirectTo(request, '/login', true);
  }

  return supabaseResponse;
}
