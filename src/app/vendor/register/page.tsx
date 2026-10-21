'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { registerVendorAction } from '@/app/(auth)/actions';
import { Store, AlertCircle, ShieldCheck, CheckCircle2, UserCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function RegisterVendorPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [loadingUser, setLoadingUser] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const errorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user ?? null);
      setLoadingUser(false);
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      if (currentUser?.id) {
        formData.set('userId', currentUser.id);
        if (!formData.get('email')) formData.set('email', currentUser.email || '');
        if (!formData.get('fullName')) formData.set('fullName', currentUser.user_metadata?.full_name || 'Store Owner');
      }

      const result = await registerVendorAction(formData);

      if (!result.success) {
        setError(result.error || 'Failed to submit vendor application.');
        setLoading(false);
        errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setSuccessMsg(result.message || 'Store onboarded successfully! Redirecting to Vendor Hub...');
      setTimeout(() => {
        window.location.href = result.redirectTo || '/vendor/dashboard';
      }, 600);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred. Please check your connection and try again.');
      setLoading(false);
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  const ownerName = currentUser?.user_metadata?.full_name || 'Account Owner';
  const ownerEmail = currentUser?.email || '';

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-xl shadow-card border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-2">
            <Store className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Register as a Grocery Vendor</CardTitle>
          <CardDescription className="dark:text-slate-400">
            Onboard your local store to reach nearby customers, showcase products, and receive orders.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Quality & Verification Notice:</span>
              New vendor applications are registered to verify store details and enable delivery zones across Kano neighborhoods.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Owner Account Section */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Owner Account Details</h4>
              
              {loadingUser ? (
                <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ) : currentUser ? (
                /* Authenticated User View: No redundant password fields needed */
                <div className="p-3.5 rounded-xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-200/70 dark:border-brand-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{ownerName}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">{ownerEmail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300">
                    Signed In
                  </span>
                  <input type="hidden" name="userId" value={currentUser.id} />
                  <input type="hidden" name="fullName" value={ownerName} />
                  <input type="hidden" name="email" value={ownerEmail} />
                </div>
              ) : (
                /* Guest View: Full registration fields */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Owner Full Name"
                    name="fullName"
                    required
                    placeholder="e.g. Mohammad Rabiu"
                  />
                  <Input
                    label="Owner Email"
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. vendor@freshgrocer.ng"
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
              )}
            </div>

            {/* Store Information Section */}
            <div className="pt-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">Store Information</h4>
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
                  placeholder="+234 812 746 6307"
                />
                <Input
                  label="Store Address"
                  name="address"
                  required
                  placeholder="e.g. Kurna IBS Line, off Katsina Road, Kano"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="City"
                    name="city"
                    required
                    defaultValue="Kano"
                    placeholder="Kano"
                  />
                  <Input
                    label="State / Region"
                    name="state"
                    required
                    defaultValue="Kano"
                    placeholder="Kano"
                  />
                  <Input
                    label="Postal Code"
                    name="postalCode"
                    defaultValue="700241"
                    placeholder="700241"
                  />
                </div>
              </div>
            </div>

            {/* Inline Feedback directly above submit button so it is never hidden */}
            <div ref={errorRef}>
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold">{successMsg}</span>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full mt-4" isLoading={loading}>
              Submit Vendor Onboarding Application
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-xs text-slate-500 dark:text-slate-400 pt-6">
          <p>
            Already an approved vendor?{' '}
            <Link href="/vendor/dashboard" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Go to Vendor Hub
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
