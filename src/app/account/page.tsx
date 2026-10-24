import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/Card';
import { AccountView } from '@/components/account/AccountView';
import type { Profile } from '@/types/database.types';

export const metadata = { title: 'My Account — FreshGrocer' };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirectTo=/account');

  const { data: profile, error } = (await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()) as { data: Profile | null; error: any };

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto w-full px-4 py-10">
        <Card role="alert" className="border-red-200 bg-red-50 text-sm text-red-700 p-6">
          Your profile could not be loaded. Please sign in again or verify your database connection.
        </Card>
      </div>
    );
  }

  return (
    <AccountView
      user={{
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
      }}
      profile={profile}
    />
  );
}

