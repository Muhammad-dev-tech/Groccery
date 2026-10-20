import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getVendorServiceAreas } from '@/domain/location/service';
import { ServiceAreaForm } from '@/components/vendor/ServiceAreaForm';
import { ServiceAreaList } from '@/components/vendor/ServiceAreaList';
import { MapPin, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const metadata = {
  title: 'Delivery & Service Zones | Vendor Hub',
};

export default async function VendorServiceAreasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/vendor/service-areas');
  }

  const { data: store } = await supabase
    .from('vendor_stores')
    .select('id, name, city, state, status')
    .eq('owner_id', user.id)
    .single();

  if (!store) {
    redirect('/vendor/register');
  }

  const serviceAreas = await getVendorServiceAreas(store.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Breadcrumb */}
      <div>
        <Link
          href="/vendor/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Vendor Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Geographic Service & Delivery Zones
              </h1>
              <Badge variant={store.status === 'approved' ? 'success' : 'warning'}>
                Store {store.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Configure the postal codes, neighborhoods, and municipal districts that{' '}
              <strong className="text-slate-800">{store.name}</strong> delivers to.
            </p>
          </div>
        </div>
      </div>

      {store.status === 'suspended' && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Store Suspended</h4>
            <p className="text-xs text-red-700 mt-0.5">
              Your store is suspended by marketplace administration. You cannot register or modify delivery zones until reinstated.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Zone Registration Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-slate-900">Add Service Zone</h2>
            </div>
            <ServiceAreaForm defaultCity={store.city} defaultState={store.state} disabled={store.status === 'suspended'} />
          </div>
        </div>

        {/* Right: Existing Zones List */}
        <div className="lg:col-span-2">
          <ServiceAreaList serviceAreas={serviceAreas} disabled={store.status === 'suspended'} />
        </div>
      </div>
    </div>
  );
}
