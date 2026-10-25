import Link from 'next/link';
import {
  Scale,
  TrendingDown,
  MapPin,
  Store,
  UserPlus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShoppingCart,
  CheckCircle2,
  Package,
  Layers,
  ChevronRight,
  BadgeCheck,
  Truck,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HeroSearchForm, LiveComparisonShowcase } from '@/components/home/HomeInteractiveSections';

// Categories with direct links to marketplace filter
const CATEGORY_AISLES = [
  {
    name: 'Rice & Grains',
    slug: 'rice-grains',
    icon: '🌾',
    desc: 'Basmati, Semovita, Wheat & Beans',
    accent: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40',
  },
  {
    name: 'Cooking Oil',
    slug: 'cooking-oil',
    icon: '🫒',
    desc: 'Groundnut, Vegetable & Soya Oil',
    accent: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40',
  },
  {
    name: 'Fresh Vegetables',
    slug: 'fresh-vegetables',
    icon: '🥦',
    desc: 'Tomatoes, Peppers, Onions & Greens',
    accent: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-200/50 dark:border-green-900/40',
  },
  {
    name: 'Dairy & Farm Eggs',
    slug: 'dairy-eggs',
    icon: '🥛',
    desc: 'Fresh Milk, Cheese, Butter & Farm Eggs',
    accent: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200/50 dark:border-sky-900/40',
  },
  {
    name: 'Meat & Fish',
    slug: 'meat-fish',
    icon: '🥩',
    desc: 'Fresh Beef, Poultry cuts & Fish',
    accent: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40',
  },
  {
    name: 'Beverages',
    slug: 'beverages',
    icon: '🧃',
    desc: 'Juices, Tea, Coffee & Bottled Drinks',
    accent: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200/50 dark:border-orange-900/40',
  },
  {
    name: 'Snacks & Nuts',
    slug: 'snacks',
    icon: '🥜',
    desc: 'Roasted Nuts, Dry Fruits & Bites',
    accent: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200/50 dark:border-yellow-900/40',
  },
  {
    name: 'Household Essentials',
    slug: 'household-essentials',
    icon: '🧼',
    desc: 'Soaps, Cleaning Agents & Paper',
    accent: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-900/40',
  },
];

const KANO_ZONES = [
  { name: 'Nassarawa GRA & State House', code: '700213', badge: 'Fast Delivery' },
  { name: 'Fagge, Kurna & Katsina Rd', code: '700241', badge: 'High Vendor Density' },
  { name: 'Sabon Gari & City Centre', code: '700211', badge: 'Wholesale Hub' },
  { name: 'Tarauni & Maiduguri Rd', code: '700223', badge: 'Active Coverage' },
  { name: 'Dala & Old City District', code: '700282', badge: 'Heritage Markets' },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col w-full overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-slate-200/60 dark:border-slate-800">
        {/* Subtle Ambient Radial Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] bg-gradient-to-tr from-brand-500/15 via-emerald-400/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
          {/* Status Live Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Live in Kano Metropolitan: Nassarawa · Fagge · Sabon Gari · Tarauni</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] max-w-4xl mx-auto">
            Smart Grocery Shopping in Kano.
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {' '}Compare Real Store Prices, Save More.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover verified independent grocery stores across your neighborhood. Compare equivalent pack sizes fairly with normalized unit pricing (₦/kg & ₦/L), and order from multiple stores in one easy checkout.
          </p>

          {/* Interactive Search Bar & Quick Location */}
          <HeroSearchForm />

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/marketplace" className="w-full sm:w-auto">
              <Button id="hero-browse" size="lg" className="w-full sm:w-auto shadow-md gap-2 px-6">
                <ShoppingCart className="w-4 h-4" />
                <span>Explore Marketplace</span>
              </Button>
            </Link>

            <Link href="/marketplace/compare" className="w-full sm:w-auto">
              <Button id="hero-compare" size="lg" variant="outline" className="w-full sm:w-auto gap-2 px-6">
                <Scale className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Compare Unit Prices</span>
              </Button>
            </Link>

            <Link href="/vendor/register" className="w-full sm:w-auto">
              <Button id="hero-vendor" size="lg" variant="ghost" className="w-full sm:w-auto gap-2">
                <Store className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span>Sell on FreshGrocer</span>
              </Button>
            </Link>
          </div>

          {/* 4 Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-6 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-xs">
              <p className="text-lg sm:text-xl font-extrabold text-brand-600 dark:text-brand-400">₦0</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Hidden Markups</p>
              <p className="text-[11px] text-slate-500">Exact in-store prices</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-xs">
              <p className="text-lg sm:text-xl font-extrabold text-brand-600 dark:text-brand-400">100%</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Normalized Pricing</p>
              <p className="text-[11px] text-slate-500">True ₦/kg & ₦/L comparison</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-xs">
              <p className="text-lg sm:text-xl font-extrabold text-brand-600 dark:text-brand-400">5+</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Kano Districts</p>
              <p className="text-[11px] text-slate-500">Verified local grocers</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 shadow-xs backdrop-blur-xs">
              <p className="text-lg sm:text-xl font-extrabold text-brand-600 dark:text-brand-400">1 Cart</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">Unified Checkout</p>
              <p className="text-[11px] text-slate-500">Order from multiple stores</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE PRICE COMPARISON SHOWCASE */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 w-full bg-slate-50/50 dark:bg-slate-900/30">
        <LiveComparisonShowcase />
      </section>

      {/* 3. BROWSE BY GROCERY AISLE */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <Badge variant="brand" className="mb-2">Marketplace Aisles</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explore Fresh Groceries by Category
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Browse staple food items, fresh produce, oils, and provisions from Kano merchants.
            </p>
          </div>

          <Link href="/marketplace" className="inline-flex items-center text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">
            <span>View All Aisles</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {CATEGORY_AISLES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/marketplace?category=${cat.slug}`}
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${cat.accent}`}>
                  {cat.icon}
                </span>
                <span className="text-slate-300 dark:text-slate-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                  {cat.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. HOW FRESHGROCER WORKS */}
      <section className="py-14 sm:py-20 bg-white dark:bg-slate-900/60 border-y border-slate-200/60 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="brand">Simple & Transparent</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How FreshGrocer Saves You Money
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Three clear steps to discover the most affordable grocery deals in your Kano neighborhood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="rounded-3xl p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4 relative">
              <span className="text-4xl font-black text-brand-600/20 dark:text-brand-400/20 font-mono">
                01
              </span>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Select Your Kano Neighborhood
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose Nassarawa GRA, Fagge, Sabon Gari, Tarauni, or Dala. You will instantly see store listings and delivery ranges tailored to your area.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4 relative">
              <span className="text-4xl font-black text-brand-600/20 dark:text-brand-400/20 font-mono">
                02
              </span>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Compare Fair Normalized Units
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Whether a grocer sells a 500g tin or a 2kg sack, our dimension-safe algorithm converts prices into exact ₦/kg or ₦/L so you know the genuine bargain.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4 relative">
              <span className="text-4xl font-black text-brand-600/20 dark:text-brand-400/20 font-mono">
                03
              </span>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                One Multi-Store Checkout
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Buy grains from Store A and oils from Store B. Review a transparent delivery breakdown and complete your purchase in one simple step.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. KANO NEIGHBORHOOD COVERAGE */}
      <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <Badge variant="brand">Local Delivery Zones</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Connecting Neighborhoods Across Kano
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click on your district to browse verified grocers serving your street.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {KANO_ZONES.map((zone) => (
            <Link
              key={zone.code}
              href={`/marketplace?postalCode=${zone.code}`}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-brand-500 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">
                    {zone.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    Code: {zone.code}
                  </span>
                  <span>· {zone.badge}</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          ))}

          {/* All Kano Card */}
          <Link
            href="/marketplace"
            className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-800/60 hover:bg-brand-100/50 transition-all flex items-center justify-between group"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                <span className="font-semibold text-xs sm:text-sm text-brand-900 dark:text-brand-200">
                  All Kano Metropolitan
                </span>
              </div>
              <p className="text-[11px] text-brand-700/80 dark:text-brand-300/80">
                Browse catalog across all registered vendor locations
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </Link>
        </div>
      </section>

      {/* 6. FOR SHOPPERS & STORE OWNERS (DUAL ADVANTAGE) */}
      <section className="py-14 sm:py-20 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* For Shoppers Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <Badge variant="brand">For Kano Shoppers</Badge>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  Stop overpaying for deceptive packaging
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Build custom shopping lists, price check the whole list across stores in seconds, and discover which vendor has the absolute lowest basket total.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time unit price conversion per 100g, 1kg & 1L</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive Shopping List total price comparison</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Single delivery coordination for multi-vendor baskets</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link href="/lists">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-brand-600" />
                    <span>Try Smart Shopping Lists</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* For Store Owners Card */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-brand-900 to-slate-950 text-white shadow-xl space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-400/20">
                <Store className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold">
                  For Independent Grocers
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Grow your store sales across Kano
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Put your inventory in front of thousands of local households. Add products with photos right from your phone, manage stock, and receive orders easily.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Verified Vendor Store Badge & digital storefront</span>
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Mobile photo uploads directly to inventory</span>
                </li>
                <li className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-brand-400 shrink-0" />
                  <span>Flexible delivery zones configured to your schedule</span>
                </li>
              </ul>

              <div className="pt-2">
                <Link href="/vendor/register">
                  <Button size="sm" className="bg-white hover:bg-slate-100 text-slate-900 font-bold gap-2">
                    <Store className="w-4 h-4 text-brand-600" />
                    <span>Register Your Store</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CLOSING CALL TO ACTION BANNER */}
      <section className="py-14 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-700 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
          {/* Decorative Background Circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/10 blur-xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kano&apos;s #1 Honest Grocery Marketplace</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto">
            Ready to experience genuine grocery price transparency?
          </h2>

          <p className="text-xs sm:text-base text-white/90 max-w-xl mx-auto">
            Join hundreds of smart Kano residents who compare unit prices and order groceries with confidence.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/marketplace" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-brand-700 font-bold shadow-lg">
                Browse Marketplace Now
              </Button>
            </Link>

            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/60 text-white hover:bg-white/15">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
