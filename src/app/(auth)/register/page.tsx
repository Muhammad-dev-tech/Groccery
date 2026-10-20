'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { registerCustomerAction } from '@/app/(auth)/actions';
import { ShoppingBag, AlertCircle } from 'lucide-react';

export default function RegisterCustomerPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await registerCustomerAction(formData);

    if (!result.success) {
      setError(result.error || 'Failed to create customer account.');
      setLoading(false);
      return;
    }

    if (result.redirectTo) {
      router.push(result.redirectTo);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-card border-slate-200">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-2">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Create Customer Account</CardTitle>
          <CardDescription>
            Join FreshGrocer to compare local prices, build shopping lists, and order fresh food.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full Name"
              name="fullName"
              required
              placeholder="e.g. Sarah Jenkins"
              autoComplete="name"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Input
              label="Phone Number (Optional)"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
            />

            <Input
              label="Password (Min. 8 characters)"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <Button type="submit" className="w-full mt-4" isLoading={loading}>
              Create Customer Account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 text-center text-xs text-slate-500 pt-6">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Sign In
            </Link>
          </p>
          <div className="pt-2 border-t border-slate-100 w-full">
            <Link href="/vendor/register" className="text-slate-600 hover:text-brand-600 font-medium">
              Are you a grocery store owner? <span className="underline">Register as a Vendor</span>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
