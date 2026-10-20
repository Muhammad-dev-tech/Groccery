import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User } from 'lucide-react';

export const metadata = { title: 'My Account — FreshGrocer' };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/account');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('full_name, phone, role, created_at')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className="p-2 rounded-xl bg-brand-50 text-brand-700">
          <User className="w-5 h-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold text-slate-900">My Account</h1>
      </div>

      {error || !profile ? (
        <Card role="alert" className="border-red-200 bg-red-50 text-sm text-red-700">
          Your profile could not be loaded. If you just signed up, make sure the database migrations have been applied.
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Profile editing, order history, and saved lists arrive in later phases.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">Name</dt>
                <dd className="text-slate-900">{profile.full_name}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">Email</dt>
                <dd className="text-slate-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">Phone</dt>
                <dd className="text-slate-900">{profile.phone ?? 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">Account type</dt>
                <dd><Badge variant={profile.role === 'admin' ? 'brand' : profile.role === 'vendor' ? 'warning' : 'slate'}>{profile.role}</Badge></dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">Email verified</dt>
                <dd className="text-slate-900">{user.email_confirmed_at ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">Member since</dt>
                <dd className="text-slate-900">{new Date(profile.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
