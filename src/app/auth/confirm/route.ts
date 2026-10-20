import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Only allow same-origin relative paths to prevent open redirects. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }
  return value;
}

/**
 * Handles links from Supabase emails (sign-up confirmation, password recovery).
 * Supabase email templates must point to:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=<type>&next=<path>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.search = '';

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      redirectUrl.pathname = next;
      return NextResponse.redirect(redirectUrl);
    }
  } else if (code) {
    // PKCE flow (default Supabase templates)
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirectUrl.pathname = next;
      return NextResponse.redirect(redirectUrl);
    }
  }

  redirectUrl.pathname = '/login';
  redirectUrl.searchParams.set('error', 'link_invalid');
  return NextResponse.redirect(redirectUrl);
}
