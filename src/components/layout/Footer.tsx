import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white">
            <ShoppingBag className="w-3.5 h-3.5" aria-hidden />
          </div>
          <span>© {new Date().getFullYear()} FreshGrocer — multi-vendor grocery marketplace (academic project, in development).</span>
        </div>
        <nav aria-label="Footer" className="flex items-center gap-4">
          <Link href="/register" className="hover:text-slate-800">Create account</Link>
          <Link href="/vendor/register" className="hover:text-slate-800">Become a vendor</Link>
          <Link href="/login" className="hover:text-slate-800">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
