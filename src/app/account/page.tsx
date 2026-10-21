import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { User, PackageCheck, ClipboardList, Store, ShoppingBag } from 'lucide-react';

export const metadata = { title: 'My Account — FreshGrocer' };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/account');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, phone, role, created_at')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-400">
          <User className="w-5 h-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Account</h1>
      </div>

      {error || !profile ? (
        <Card role="alert" className="border-red-200 bg-red-50 text-sm text-red-700">
          Your profile could not be loaded. If you just signed up, make sure the database migrations have been applied.
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your registered identity, contact details, and account permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">Name</dt>
                  <dd className="text-slate-900 font-medium">{profile.full_name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">Email</dt>
                  <dd className="text-slate-900 font-medium">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">Phone</dt>
                  <dd className="text-slate-900 font-medium">{profile.phone ?? 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">Account Type</dt>
                  <dd className="mt-0.5">
                    <Badge variant={profile.role === 'admin' ? 'brand' : profile.role === 'vendor' ? 'warning' : 'slate'}>
                      {profile.role.toUpperCase()}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">Email Verified</dt>
                  <dd className="text-slate-900 font-medium">{user.email_confirmed_at ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">Member Since</dt>
                  <dd className="text-slate-900 font-medium">{new Date(profile.created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Quick Account Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/orders" className="group">
              <Card className="p-4 hover:border-brand-500/50 transition-all duration-200 hover:shadow-md cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">My Orders</h3>
                    <p className="text-xs text-slate-500">Track current deliveries & order history</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/lists" className="group">
              <Card className="p-4 hover:border-brand-500/50 transition-all duration-200 hover:shadow-md cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Shopping Lists</h3>
                    <p className="text-xs text-slate-500">Create lists & run smart cost comparisons</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link href="/marketplace" className="group">
              <Card className="p-4 hover:border-brand-500/50 transition-all duration-200 hover:shadow-md cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Marketplace</h3>
                    <p className="text-xs text-slate-500">Discover & buy fresh groceries locally</p>
                  </div>
                </div>
              </Card>
            </Link>

            {profile.role === 'customer' ? (
              <Link href="/vendor/register" className="group">
                <Card className="p-4 hover:border-brand-500/50 transition-all duration-200 hover:shadow-md cursor-pointer bg-gradient-to-br from-white to-brand-50/30 dark:from-slate-900 dark:to-brand-950/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Become a Vendor</h3>
                      <p className="text-xs text-slate-500">Register your grocery store in Kano</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ) : (
              <Link href="/vendor/dashboard" className="group">
                <Card className="p-4 hover:border-brand-500/50 transition-all duration-200 hover:shadow-md cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Vendor Portal</h3>
                      <p className="text-xs text-slate-500">Manage catalog, deliveries & orders</p>
                    </div>
                  </div>
                </Card>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
