import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Store, Clock, CheckCircle2, XCircle, PauseCircle } from 'lucide-react';
import type { StoreStatus } from '@/types/database.types';

export const metadata = { title: 'Vendor Hub — FreshGrocer' };

const STATUS_COPY: Record<StoreStatus, { label: string; variant: 'warning' | 'success' | 'danger' | 'slate'; text: string; Icon: typeof Clock }> = {
  pending: { label: 'Pending review', variant: 'warning', Icon: Clock, text: 'An administrator is reviewing your application. You cannot publish products until it is approved.' },
  approved: { label: 'Approved', variant: 'success', Icon: CheckCircle2, text: 'Your store is approved. Product and inventory management will be enabled in Phase 2.' },
  rejected: { label: 'Rejected', variant: 'danger', Icon: XCircle, text: 'Your application was not approved. Please contact platform support for details.' },
  suspended: { label: 'Suspended', variant: 'slate', Icon: PauseCircle, text: 'Your store is suspended. You cannot publish products or accept new orders.' },
};

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/vendor/dashboard');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || (profile.role !== 'vendor' && profile.role !== 'admin')) redirect('/');

  const { data: store } = await supabase
    .from('vendor_stores')
    .select('name, city, state, status, created_at')
    .eq('owner_id', user.id)
    .maybeSingle();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className="p-2 rounded-xl bg-brand-50 text-brand-700">
          <Store className="w-5 h-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-slate-900">Vendor Hub</h1>
      </div>

      {!store ? (
        <Card>
          <CardTitle>No store found</CardTitle>
          <CardDescription className="mt-2">
            Your account has no store application on file. Store onboarding for existing accounts is added in Phase 2.
          </CardDescription>
        </Card>
      ) : (
        (() => {
          const s = STATUS_COPY[store.status];
          return (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{store.name}</CardTitle>
                  <CardDescription>{store.city}, {store.state} · applied {new Date(store.created_at).toLocaleDateString()}</CardDescription>
                </div>
                <Badge variant={s.variant}>{s.label}</Badge>
              </CardHeader>
              <CardContent className="flex items-start gap-3 text-sm text-slate-600">
                <s.Icon className="w-5 h-5 shrink-0 text-slate-400" aria-hidden />
                <p>{s.text}</p>
              </CardContent>
            </Card>
          );
        })()
      )}
    </div>
  );
}
