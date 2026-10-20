'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { resetPasswordAction } from '@/app/(auth)/actions';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await resetPasswordAction(formData);

    if (!result.success) {
      setError(result.error || 'Failed to send password reset email.');
      setLoading(false);
      return;
    }

    setSuccess(result.message || 'Password reset link sent to your email.');
    setLoading(false);
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 py-12">
      <Card className="w-full max-w-md shadow-card border-slate-200">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your registered account email and we will send you secure recovery instructions.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              autoComplete="email"
            />

            <Button type="submit" className="w-full mt-2" isLoading={loading}>
              Send Reset Instructions
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center text-xs text-slate-500 pt-6">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Return to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
