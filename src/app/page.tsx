import Link from 'next/link';
import { Scale, ShoppingCart, MapPin, ArrowRight, Store } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HeroSearchForm } from '@/components/home/HomeInteractiveSections';

const AISLES = [
  { name: 'Rice & Grains', slug: 'rice-grains', icon: '🌾' },
  { name: 'Cooking Oil', slug: 'cooking-oil', icon: '🫒' },
  { name: 'Fresh Vegetables', slug: 'fresh-vegetables', icon: '🥦' },
  { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥛' },
  { name: 'Meat & Fish', slug: 'meat-fish', icon: '🥩' },
  { name: 'Household Essentials', slug: 'household-essentials', icon: '🧼' },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col w-full">
      {/* Hero */}
      <section className="pt-16 pb-14 sm:pt-24 sm:pb-20 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Kano Local Grocery Marketplace</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
            Compare grocery prices across Kano.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Discover verified local stores, compare true unit prices in ₦/kg and ₦/L, and order across multiple grocers in one checkout.
          </p>

          {/* Minimalist Search & Zone Input */}
          <div className="pt-2">
            <HeroSearchForm />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <Link href="/marketplace">
              <Button size="md" className="gap-2">
                <span>Browse marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/marketplace/compare">
              <Button size="md" variant="outline" className="gap-2">
                <Scale className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Compare items</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Aisles
          </h2>
          <Link
            href="/marketplace"
            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
          >
            All products →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {AISLES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/marketplace?category=${cat.slug}`}
              className="group p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all flex flex-col items-center text-center space-y-1.5"
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works / Core Principles */}
      <section className="py-12 border-t border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <Scale className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Normalized unit pricing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Compare a 500g pack against a 2kg pack using true ₦/kg and ₦/L conversions. Deceptive packaging is eliminated.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Multi-store checkout
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Order different staples from different grocers in your neighborhood with a single order and clear delivery breakdown.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Verified local grocers
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Direct in-store inventory and prices from merchants serving Nassarawa, Fagge, Sabon Gari, Tarauni, and Dala.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple, mature footer callout */}
      <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-1.5">
              <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Own a grocery store in Kano?</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              List your store catalog, upload product photos directly from your phone, and receive orders from local customers.
            </p>
          </div>

          <Link href="/vendor/register" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto">
              Register store
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
