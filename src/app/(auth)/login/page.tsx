'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { signInAction } from '@/app/(auth)/actions';
import { ShoppingBag, AlertCircle, CheckCircle2 } from 'lucide-react';

function safeRedirect(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return null;
  return value;
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="flex-1" aria-busy="true" />}>
      <LoginForm />
    </React.Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = React.useState<string | null>(
    searchParams.get('error') === 'link_invalid'
      ? 'That email link is invalid or has expired. Please request a new one.'
      : null
  );
  const [loading, setLoading] = React.useState(false);

  const registered = searchParams.get('registered');
  const vendorPending = searchParams.get('vendorPending');
  const passwordUpdated = searchParams.get('passwordUpdated');
  const requestedPath = safeRedirect(searchParams.get('redirectTo'));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signInAction(formData);

    if (!result.success) {
      setError(result.error || 'Failed to sign in. Please verify your credentials.');
      setLoading(false);
      return;
    }

    if (result.redirectTo) {
      router.push(requestedPath ?? result.redirectTo);
      router.refresh();
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-card border-slate-200">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-2">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Sign in to FreshGrocer</CardTitle>
          <CardDescription>Access your customer orders, vendor store, or administration dashboard.</CardDescription>
        </CardHeader>

        <CardContent>
          {registered && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account created! Check your inbox to verify your email, then sign in.</span>
            </div>
          )}

          {passwordUpdated && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password updated. Sign in with your new password.</span>
            </div>
          )}

          {vendorPending && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Vendor application submitted! Your store is pending administrator review.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">Password</label>
                <Link href="/reset-password" className="text-xs font-medium text-brand-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 text-center text-xs text-slate-500 pt-6">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-brand-600 hover:underline">
              Create an account
            </Link>
          </p>
          <div className="pt-2 border-t border-slate-100 w-full">
            <Link href="/vendor/register" className="text-slate-600 hover:text-brand-600 font-medium">
              Want to sell groceries? <span className="underline">Register as a Vendor</span>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
