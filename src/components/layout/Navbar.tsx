'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { User as AuthUser } from '@supabase/supabase-js';
import { ShoppingBag, Store, Shield, User, Menu, X, LogOut, ClipboardList, PackageCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole, Profile } from '@/types/database.types';
import { LocationSelector } from './LocationSelector';
import { CartNavButton } from '@/components/cart/CartNavButton';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Navbar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [role, setRole] = React.useState<UserRole | null>(null);
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    async function loadRole(u: AuthUser | null) {
      setUser(u);
      if (!u) {
        setRole(null);
        return;
      }
      const { data } = (await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single()) as { data: Profile | null; error: any };
      setRole(data?.role ?? null);
    }

    supabase.auth.getUser().then(({ data }) => loadRole(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      void loadRole(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  const roleLinks = (
    <>
      <Link
        id="nav-lists"
        href="/lists"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
      >
        <ClipboardList className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" aria-hidden /> Lists
      </Link>
      <Link
        id="nav-orders"
        href="/orders"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
      >
        <PackageCheck className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" aria-hidden /> Orders
      </Link>
      {role === 'admin' && (
        <Link
          id="nav-admin"
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
        >
          <Shield className="w-3.5 h-3.5" aria-hidden /> Admin
        </Link>
      )}
      {(role === 'vendor' || role === 'admin') && (
        <Link
          id="nav-vendor"
          href="/vendor/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
        >
          <Store className="w-3.5 h-3.5" aria-hidden /> Vendor Hub
        </Link>
      )}
      <Link
        id="nav-account"
        href="/account"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
      >
        <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" aria-hidden /> Account
      </Link>
      <button
        id="nav-signout"
        type="button"
        onClick={handleSignOut}
        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" aria-hidden /> Sign out
      </button>
    </>
  );

  const guestLinks = (
    <>
      <Link
        id="nav-sell"
        href="/vendor/register"
        onClick={() => setMobileOpen(false)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-700 dark:hover:text-brand-400 transition-colors"
      >
        <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden /> Sell on FreshGrocer
      </Link>
      <Link
        id="nav-login"
        href="/login"
        onClick={() => setMobileOpen(false)}
        className="px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        Sign In
      </Link>
      <Link
        id="nav-register"
        href="/register"
        onClick={() => setMobileOpen(false)}
        className="px-4 py-2 text-sm font-semibold text-white bg-brand-600 rounded-xl hover:bg-brand-700 shadow-sm text-center transition-colors"
      >
        Create Account
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 group" aria-label="FreshGrocer home">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <ShoppingBag className="w-5 h-5" aria-hidden />
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              Fresh<span className="text-brand-600 dark:text-brand-400">Grocer</span>
            </span>
          </Link>

          <Link
            id="nav-marketplace"
            href="/marketplace"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-brand-50/70 dark:hover:bg-slate-900 border border-transparent hover:border-brand-200 dark:hover:border-slate-700 transition-colors"
          >
            Browse Marketplace
          </Link>

          <React.Suspense fallback={<div className="h-7 w-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />}>
            <LocationSelector />
          </React.Suspense>
        </div>

        <nav aria-label="Primary" className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <CartNavButton />
          {user ? roleLinks : guestLinks}
        </nav>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <CartNavButton onClick={() => setMobileOpen(false)} />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 flex flex-col gap-2">
          <Link
            id="nav-marketplace-mobile"
            href="/marketplace"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-brand-700 dark:text-brand-300 px-3 py-2.5 rounded-lg bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800"
          >
            Browse Marketplace
          </Link>
          {user ? roleLinks : guestLinks}
        </nav>
      )}
    </header>
  );
}
