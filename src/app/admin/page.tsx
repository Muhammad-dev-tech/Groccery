import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AssignAdminForm } from '@/components/admin/AssignAdminForm';
import { Shield, Users, Store, Activity } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectTo=/admin');
  }

  // Authoritative server-side check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/?unauthorized=admin');
  }

  // Fetch registered users and stores
  const { data: usersList } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  const { data: auditLogs } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

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
          <p className="text-sm text-slate-500">
            Welcome, {profile.full_name}. Master security, role delegation, and vendor governance portal.
          </p>
        </div>
        <Badge variant="brand">Strict Server Authorization Active</Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
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
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Governance Status</CardTitle>
            <Store className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-600">Active</div>
            <p className="text-xs text-slate-500 mt-1">RLS policies enforced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
            <CardTitle className="text-xs uppercase font-bold text-slate-500">Security Audit Logs</CardTitle>
            <Activity className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-purple-600">{auditLogs?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Audited privileged events</p>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
