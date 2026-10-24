import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden />
          </div>
          <span>© {new Date().getFullYear()} FreshGrocer — multi-vendor grocery marketplace.</span>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-4">
          <Link href="/register" className="hover:text-slate-800 dark:hover:text-white transition-colors">Create account</Link>
          <Link href="/vendor/register" className="hover:text-slate-800 dark:hover:text-white transition-colors">Become a vendor</Link>
          <Link href="/login" className="hover:text-slate-800 dark:hover:text-white transition-colors">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
