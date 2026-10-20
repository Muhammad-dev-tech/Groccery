'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { updatePasswordAction } from '@/app/(auth)/actions';
import { KeyRound, AlertCircle } from 'lucide-react';

export default function ConfirmResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const result = await updatePasswordAction(new FormData(event.currentTarget));
    if (!result.success) {
      setError(result.error || 'Could not update password. The reset link may have expired.');
      setLoading(false);
      return;
    }
    router.push('/login?passwordUpdated=true');
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-2">
            <KeyRound className="w-6 h-6" aria-hidden />
          </div>
          <CardTitle className="text-2xl font-bold">Choose a New Password</CardTitle>
          <CardDescription>Enter and confirm your new password.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="new-password" label="New Password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            <Input id="confirm-new-password" label="Confirm Password" name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" />
            <Button id="update-password-submit" type="submit" className="w-full" isLoading={loading}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
