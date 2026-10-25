'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, Scale, Check, Sparkles, TrendingDown, Store, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const COMPARISON_DEMOS = [
  {
    category: 'Rice & Grains',
    icon: '🌾',
    itemTitle: 'Premium Long Grain Parboiled Rice',
    unitNote: 'Compared by normalized ₦/kg',
    cardA: {
      store: 'Kano Central Provisions',
      location: 'Sabon Gari',
      package: '500 g pack',
      price: 1400,
      unitPrice: 2800,
      unitText: '₦2,800 / kg',
      isBestValue: false,
    },
    cardB: {
      store: 'Fagge Modern Grocers',
      location: 'Fagge District',
      package: '2 kg bag',
      price: 4600,
      unitPrice: 2300,
      unitText: '₦2,300 / kg',
      isBestValue: true,
      savingsNote: 'Saves ₦500 per kg (18% cheaper)',
    },
  },
  {
    category: 'Cooking Oil',
    icon: '🫒',
    itemTitle: 'Pure Refined Vegetable Cooking Oil',
    unitNote: 'Compared by normalized ₦/Litre',
    cardA: {
      store: 'Nassarawa Supermarket',
      location: 'Nassarawa GRA',
      package: '750 ml bottle',
      price: 2700,
      unitPrice: 3600,
      unitText: '₦3,600 / L',
      isBestValue: false,
    },
    cardB: {
      store: 'Al-Baraka Wholesale Mart',
      location: 'Tarauni',
      package: '2 Litre container',
      price: 6400,
      unitPrice: 3200,
      unitText: '₦3,200 / L',
      isBestValue: true,
      savingsNote: 'Saves ₦400 per Litre (11% cheaper)',
    },
  },
  {
    category: 'Semovita & Flours',
    icon: '🥞',
    itemTitle: 'Golden Semovita Enriched Flour',
    unitNote: 'Compared by normalized ₦/kg',
    cardA: {
      store: 'Dala Neighborhood Mart',
      location: 'Dala Heritage',
      package: '1 kg pack',
      price: 1650,
      unitPrice: 1650,
      unitText: '₦1,650 / kg',
      isBestValue: false,
    },
    cardB: {
      store: 'Kurmi Community Food Hub',
      location: 'City Centre',
      package: '2 kg family pack',
      price: 2900,
      unitPrice: 1450,
      unitText: '₦1,450 / kg',
      isBestValue: true,
      savingsNote: 'Saves ₦200 per kg (12% cheaper)',
    },
  },
];

export function HeroSearchForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPostal, setSelectedPostal] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    }
    if (selectedPostal) {
      params.set('postalCode', selectedPostal);
    }
    router.push(`/marketplace?${params.toString()}`);
  };

  const setQuickSearch = (term: string) => {
    setSearchTerm(term);
    router.push(`/marketplace?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* Search & Location Input Bar */}
      <form
        onSubmit={handleSearch}
        className="p-1.5 sm:p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
      >
        <div className="flex-1 flex items-center px-3 gap-2.5 min-w-0">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search groceries (e.g. Basmati Rice, Semovita, Oil)..."
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none py-1.5"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />

        <div className="flex items-center px-3 gap-2 min-w-0 sm:w-48">
          <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
          <select
            value={selectedPostal}
            onChange={(e) => setSelectedPostal(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-700 dark:text-slate-200 focus:outline-none py-1.5 cursor-pointer truncate"
          >
            <option value="" className="dark:bg-slate-900">All Kano Stores</option>
            <option value="700213" className="dark:bg-slate-900">Nassarawa GRA</option>
            <option value="700241" className="dark:bg-slate-900">Fagge / Kurna</option>
            <option value="700211" className="dark:bg-slate-900">Sabon Gari</option>
            <option value="700223" className="dark:bg-slate-900">Tarauni</option>
            <option value="700282" className="dark:bg-slate-900">Dala / Gwale</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md hover:shadow-brand-600/25 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <span>Find Deals</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Search Chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium text-slate-600 dark:text-slate-300">Popular:</span>
        {['Basmati Rice', 'Cooking Oil', 'Semovita', 'Farm Eggs', 'Fresh Tomatoes'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setQuickSearch(item)}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-brand-950/50 hover:text-brand-700 dark:hover:text-brand-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LiveComparisonShowcase() {
  const [activeTab, setActiveTab] = React.useState(0);
  const currentDemo = COMPARISON_DEMOS[activeTab];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950/90 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl shadow-slate-200/30 dark:shadow-none space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 text-xs font-semibold mb-1">
            <Scale className="w-3.5 h-3.5" />
            <span>Interactive Live Unit Comparison</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            See how normalized ₦/kg reveals the true deal
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Different pack sizes often hide higher costs. FreshGrocer normalizes every item fairly.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0 self-start sm:self-auto">
          {COMPARISON_DEMOS.map((demo, idx) => (
            <button
              key={demo.category}
              onClick={() => setActiveTab(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === idx
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{demo.icon}</span>
              <span className="hidden sm:inline">{demo.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
          <span>Comparing: <strong className="text-slate-800 dark:text-slate-200">{currentDemo.itemTitle}</strong></span>
          <span className="text-brand-600 dark:text-brand-400 font-semibold">{currentDemo.unitNote}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card A */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 relative overflow-hidden transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  Store Option 1
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentDemo.cardA.store}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {currentDemo.cardA.location}, Kano
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold">
                {currentDemo.cardA.package}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400">Shelf Price</span>
                <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">
                  ₦{currentDemo.cardA.price.toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-medium">Normalized Unit Cost</span>
                <p className="text-base font-bold text-slate-600 dark:text-slate-300">
                  {currentDemo.cardA.unitText}
                </p>
              </div>
            </div>
          </div>

          {/* Card B (Best Value) */}
          <div className="rounded-2xl border-2 border-brand-500 dark:border-brand-500/80 bg-brand-50/20 dark:bg-brand-950/20 p-5 space-y-4 relative overflow-hidden shadow-md shadow-brand-500/5">
            {/* Best Value Badge */}
            <div className="absolute top-0 right-0 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3" />
              <span>Best Value</span>
            </div>

            <div className="flex items-start justify-between pr-20">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-600 dark:text-brand-400">
                  Store Option 2
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {currentDemo.cardB.store}
                </h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {currentDemo.cardB.location}, Kano
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-brand-200/60 dark:border-brand-800/60 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400">Shelf Price ({currentDemo.cardB.package})</span>
                <p className="text-lg font-extrabold text-brand-700 dark:text-brand-400">
                  ₦{currentDemo.cardB.price.toLocaleString()}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">True Unit Cost</span>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {currentDemo.cardB.unitText}
                </p>
              </div>
            </div>

            {/* Savings Callout */}
            <div className="p-2 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{currentDemo.cardB.savingsNote}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA & explanation */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center gap-1.5 text-center sm:text-left">
          <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Dimension-safe conversion protects against deceptive packaging across all Kano grocers.</span>
        </p>

        <Link href="/marketplace/compare" className="shrink-0 w-full sm:w-auto">
          <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs">
            Try Price Compare Tool <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
