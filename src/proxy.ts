import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Next.js 16 "proxy" (formerly middleware): refreshes the Supabase session cookie
 * and performs coarse route guarding. Every protected page and server action ALSO
 * re-checks authorization server-side — this layer is not the only defense.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
