'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  PackageCheck,
  ClipboardList,
  Store,
  ShoppingBag,
  Shield,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  LogOut,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/database.types';

interface AccountViewProps {
  user: {
    id: string;
    email?: string | null;
    email_confirmed_at?: string | null;
    created_at?: string;
  };
  profile: Profile;
}

export function AccountView({ user, profile }: AccountViewProps) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const supabase = React.useMemo(() => createClient(), []);

  async function handleSignOut() {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const roleBadgeVariant =
    profile.role === 'admin' ? 'brand' : profile.role === 'vendor' ? 'warning' : 'slate';

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, orders, and marketplace shortcuts.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-800"
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </Button>
      </div>

      {/* 1. Profile Summary Card (With Human Head Avatar & Expandable Details) */}
      <Card className="overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/90">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          {/* Avatar and High-Level Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/20 ring-4 ring-brand-50 dark:ring-brand-950/40">
                <User className="w-8 h-8 sm:w-9 sm:h-9" aria-hidden />
              </div>
              {user.email_confirmed_at && (
                <span
                  title="Verified Account"
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-slate-900"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  {profile.full_name || 'Member'}
                </h2>
                <Badge variant={roleBadgeVariant} className="uppercase text-[10px] tracking-wider font-extrabold">
                  {profile.role}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Toggle Button to View/Hide Account Details */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="self-start sm:self-center text-xs font-semibold gap-1.5 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-expanded={detailsOpen}
          >
            <span>{detailsOpen ? 'Hide Profile Details' : 'View Profile Details'}</span>
            {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Expandable Account Details Panel */}
        {detailsOpen && (
          <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 animate-in fade-in slide-in-from-top-2 duration-150">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Registered Profile Details
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1">
                  <User className="w-3 h-3 text-brand-600" /> Full Name
                </dt>
                <dd className="font-bold text-slate-900 dark:text-white text-sm">
                  {profile.full_name || 'Not specified'}
                </dd>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1">
                  <Mail className="w-3 h-3 text-brand-600" /> Email Address
                </dt>
                <dd className="font-bold text-slate-900 dark:text-white truncate">
                  {user.email}
                </dd>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-brand-600" /> Phone Number
                </dt>
                <dd className="font-bold text-slate-900 dark:text-white">
                  {profile.phone || 'Not provided'}
                </dd>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-brand-600" /> Email Status
                </dt>
                <dd className="font-bold text-slate-900 dark:text-white">
                  {user.email_confirmed_at ? 'Verified & Active' : 'Unconfirmed'}
                </dd>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-600" /> Member Since
                </dt>
                <dd className="font-bold text-slate-900 dark:text-white">
                  {new Date(profile.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </dd>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-1">
                <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-600" /> Role & Access
                </dt>
                <dd className="font-bold text-slate-900 dark:text-white capitalize">
                  {profile.role} privileges
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Card>

      {/* 2. Professional Navigation Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Navigation & Services
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card: My Orders */}
          <Link href="/orders" className="group block focus:outline-none">
            <Card className="h-full p-5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-emerald-500/60 dark:hover:border-emerald-500/50 hover:shadow-lg dark:hover:shadow-emerald-950/20 transition-all duration-200 rounded-2xl flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-200 shrink-0">
                    <PackageCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      My Orders
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Track active deliveries, partitioned store fulfillments & receipt history
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60">
                  Deliveries
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">
                  View status →
                </span>
              </div>
            </Card>
          </Link>

          {/* Card: Shopping Lists */}
          <Link href="/lists" className="group block focus:outline-none">
            <Card className="h-full p-5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-lg dark:hover:shadow-amber-950/20 transition-all duration-200 rounded-2xl flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all duration-200 shrink-0">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      Shopping Lists
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Build grocery lists & run automated multi-vendor cost optimizer
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                  Cost Analysis
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">
                  Compare baskets →
                </span>
              </div>
            </Card>
          </Link>

          {/* Card: Marketplace */}
          <Link href="/marketplace" className="group block focus:outline-none">
            <Card className="h-full p-5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-brand-500/60 dark:hover:border-brand-500/50 hover:shadow-lg dark:hover:shadow-brand-950/20 transition-all duration-200 rounded-2xl flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-600 group-hover:text-white transition-all duration-200 shrink-0">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      Marketplace
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Discover verified Kano independent vendors and compare unit prices
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded-md border border-brand-200/60 dark:border-brand-800/60">
                  Local Stores
                </span>
                <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">
                  Shop catalog →
                </span>
              </div>
            </Card>
          </Link>

          {/* Card: Vendor Portal OR Become a Vendor */}
          {profile.role === 'vendor' || profile.role === 'admin' ? (
            <Link href="/vendor/dashboard" className="group block focus:outline-none">
              <Card className="h-full p-5 border border-purple-200/80 dark:border-purple-850/80 bg-white dark:bg-slate-900/90 hover:border-purple-500/70 hover:shadow-lg dark:hover:shadow-purple-950/20 transition-all duration-200 rounded-2xl flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Vendor Hub
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Manage products, stock quantity, Kano delivery zones & customer orders
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/60">
                    Store Manager
                  </span>
                  <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">
                    Open dashboard →
                  </span>
                </div>
              </Card>
            </Link>
          ) : (
            <Link href="/vendor/register" className="group block focus:outline-none">
              <Card className="h-full p-5 border border-purple-200/80 dark:border-purple-850/80 bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20 hover:border-purple-500/70 hover:shadow-lg transition-all duration-200 rounded-2xl flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200 shrink-0">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        Sell on FreshGrocer
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Register your local Kano grocery store and start receiving orders
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-800/60">
                    Vendor Onboarding
                  </span>
                  <span className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-medium">
                    Apply now →
                  </span>
                </div>
              </Card>
            </Link>
          )}

          {/* Admin Console Card (Only for admin) */}
          {profile.role === 'admin' && (
            <Link href="/admin" className="group block focus:outline-none sm:col-span-2">
              <Card className="p-5 border border-indigo-200/80 dark:border-indigo-850/80 bg-white dark:bg-slate-900/90 hover:border-indigo-500/70 hover:shadow-lg dark:hover:shadow-indigo-950/20 transition-all duration-200 rounded-2xl flex flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200 shrink-0">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Administration Console
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        Approve store registrations, moderate catalog products & inspect tamper-evident audit logs
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 mt-2" />
                </div>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
