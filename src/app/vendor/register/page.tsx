'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { registerVendorAction } from '@/app/(auth)/actions';
import { Store, AlertCircle, ShieldCheck } from 'lucide-react';

export default function RegisterVendorPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await registerVendorAction(formData);

    if (!result.success) {
      setError(result.error || 'Failed to submit vendor application.');
      setLoading(false);
      return;
    }

    if (result.redirectTo) {
      router.push(result.redirectTo);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-xl shadow-card border-slate-200">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-2">
            <Store className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Register as a Grocery Vendor</CardTitle>
          <CardDescription>
            Onboard your local store to reach nearby customers, showcase products, and receive orders.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 block">Quality & Verification Notice:</span>
              All new grocery vendor applications are created in <span className="font-medium text-amber-700">pending</span> status. Platform administrators verify store details prior to publishing listings to ensure market authenticity.
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Owner Account Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Owner Full Name"
                  name="fullName"
                  required
                  placeholder="e.g. Marcus Vance"
                />
                <Input
                  label="Owner Email"
                  name="email"
                  type="email"
                  required
                  placeholder="marcus@grocerystore.com"
                />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Store Information</h4>
              <div className="space-y-3">
                <Input
                  label="Store Name"
                  name="storeName"
                  required
                  placeholder="e.g. Dawanau Grain Mart or Kwari Provisions"
                />
                <Input
                  label="Store Contact Phone"
                  name="contactPhone"
                  type="tel"
                  required
                  placeholder="+234 802 345 6789"
                />
                <Input
                  label="Store Address"
                  name="address"
                  required
                  placeholder="e.g. 45 Murtala Mohammed Way, Kano"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="City"
                    name="city"
                    required
                    placeholder="Kano"
                  />
                  <Input
                    label="State / Region"
                    name="state"
                    required
                    placeholder="Kano"
                  />
                  <Input
                    label="Postal Code"
                    name="postalCode"
                    placeholder="700241"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-4" isLoading={loading}>
              Submit Vendor Onboarding Application
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-xs text-slate-500 pt-6">
          <p>
            Already an approved vendor?{' '}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              Sign In to Vendor Hub
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
