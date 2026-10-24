import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AssignAdminForm } from '@/components/admin/AssignAdminForm';
import { StoreModerationTable, type AdminStoreRow } from '@/components/admin/StoreModerationTable';
import { Shield, Users, Store, Activity, AlertCircle } from 'lucide-react';
import type { Profile } from '@/types/database.types';

export const metadata = { title: 'Platform Administration — FreshGrocer' };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  // Authoritative server-side check
  const { data: profile } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()) as { data: Profile | null; error: any };

  if (!profile || profile.role !== 'admin') {
    redirect('/?unauthorized=admin');
  }

  // Fetch registered users
  const { data: usersList } = (await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)) as { data: Profile[] | null; error: any };

  // Fetch vendor stores with owner details
  const { data: storesList } = await supabase
    .from('vendor_stores')
    .select(`
      *,
      owner:profiles!vendor_stores_owner_id_fkey(full_name)
    `)
    .order('created_at', { ascending: false });

  // Fetch recent audit logs
  const { data: auditLogs } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(8);

  const formattedStores: AdminStoreRow[] = (storesList || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    owner_id: s.owner_id,
    ownerName: s.owner?.full_name || 'Store Owner',
    contact_email: s.contact_email,
    contact_phone: s.contact_phone,
    city: s.city,
    state: s.state,
    status: s.status,
    created_at: s.created_at,
  }));

  const pendingStoresCount = formattedStores.filter((s) => s.status === 'pending').length;
  const approvedStoresCount = formattedStores.filter((s) => s.status === 'approved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Platform Administration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Welcome, {profile.full_name}. Master security, store moderation, and vendor governance portal.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingStoresCount > 0 && (
            <Badge variant="warning">
              {pendingStoresCount} Store{pendingStoresCount > 1 ? 's' : ''} Awaiting Review
            </Badge>
          )}
          <Badge variant="brand">Strict Server Authorization Active</Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Registered Users</CardTitle>
            <Users className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{usersList?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Platform profiles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Approved Stores</CardTitle>
            <Store className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">{approvedStoresCount}</div>
            <p className="text-xs text-slate-500 mt-1">Publishing active products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Pending Review</CardTitle>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600">{pendingStoresCount}</div>
            <p className="text-xs text-slate-500 mt-1">Awaiting store review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Audit Events</CardTitle>
            <Activity className="w-4 h-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-purple-600">{auditLogs?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Audited actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Store Moderation Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Vendor Store Applications & Governance</CardTitle>
              <CardDescription>
                Review onboarding submissions. Approve stores to enable product catalog publishing, or suspend violating merchants.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StoreModerationTable stores={formattedStores} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Protected Privilege Delegation Form */}
        <Card className="border-purple-200 bg-purple-50/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-base text-purple-950">
                Assign Administrative Privileges
              </CardTitle>
            </div>
            <CardDescription>
              Protected administrative delegation. Public users cannot grant this role. All assignments are audited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AssignAdminForm />
          </CardContent>
        </Card>

        {/* User Profiles & Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">User Profiles & Active Roles</CardTitle>
            <CardDescription>Review recent account registrations and security tiers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">User ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList && usersList.length > 0 ? (
                    usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{u.full_name}</td>
                        <td className="py-2.5 px-3">
                          <Badge
                            variant={
                              u.role === 'admin'
                                ? 'brand'
                                : u.role === 'vendor'
                                ? 'warning'
                                : 'slate'
                            }
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400 select-all">
                          {u.id.substring(0, 13)}...
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        No external user profiles detected in current environment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Audit Trail */}
      {auditLogs && auditLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-slate-900">Recent Security & Moderation Audit Logs</CardTitle>
            <CardDescription>Immutable record of privileged operations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Target Entity</th>
                    <th className="py-2.5 px-3">Target ID</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-purple-700">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 text-slate-800">{log.target_entity}</td>
                      <td className="py-2.5 px-3 text-slate-500 select-all">
                        {log.target_id ? log.target_id.substring(0, 13) + '...' : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans text-xs">
                        {typeof log.details === 'object' && log.details !== null
                          ? JSON.stringify(log.details)
                          : String(log.details || '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
