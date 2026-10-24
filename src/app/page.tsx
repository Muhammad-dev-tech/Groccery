import Link from 'next/link';
import { Scale, TrendingDown, MapPin, Store, UserPlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const PILLARS = [
  {
    Icon: Scale,
    tone: 'bg-brand-50 text-brand-600 dark:bg-brand-950/80 dark:text-brand-400',
    title: 'Normalized price comparison',
    body: 'Compare a 500 g pack against a 1 kg pack using dimension-safe unit conversion. Mass is never compared with volume.',
  },
  {
    Icon: TrendingDown,
    tone: 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400',
    title: 'Shopping-list cost analysis',
    body: 'Price a whole list across vendors. Missing items are flagged, never counted as free.',
  },
  {
    Icon: MapPin,
    tone: 'bg-sky-50 text-sky-600 dark:bg-sky-950/80 dark:text-sky-400',
    title: 'Location-aware discovery',
    body: 'Vendors declare the service zones they actually serve. New cities are added as data, not code.',
  },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col w-full overflow-hidden">
      <section className="py-12 sm:py-16 md:py-24 border-b border-slate-200/60 dark:border-slate-800 transition-colors">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800 text-brand-800 dark:text-brand-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" aria-hidden />
            Multi-vendor grocery marketplace
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Compare grocery prices across{' '}
            <span className="text-brand-600 dark:text-brand-400">independent local stores</span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300">
            One marketplace for your community: discover local vendors, compare equivalent products fairly, and order from several stores in one checkout.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/marketplace" className="w-full sm:w-auto">
              <Button id="hero-browse" size="lg" className="w-full sm:w-auto shadow-md">
                Browse marketplace
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button id="hero-register" size="lg" variant="outline" className="w-full sm:w-auto">
                <UserPlus className="w-4 h-4" aria-hidden /> Create account
              </Button>
            </Link>
            <Link href="/vendor/register" className="w-full sm:w-auto">
              <Button id="hero-vendor" size="lg" variant="ghost" className="w-full sm:w-auto">
                <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" aria-hidden /> Sell with us
              </Button>
            </Link>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Compare unit prices normalized per 100 g, 1 kg, 1 L, or piece across verified local vendors.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <Badge variant="brand" className="mb-2">What we are building</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Built for transparency and choice</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map(({ Icon, tone, title, body }) => (
            <Card key={title} className="hover:shadow-premium transition-smooth">
              <CardHeader className="space-y-3 border-none pb-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tone}`}>
                  <Icon className="w-6 h-6" aria-hidden />
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
