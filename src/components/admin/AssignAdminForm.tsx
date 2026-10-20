'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { assignAdminRoleAction } from '@/app/(auth)/actions';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

export function AssignAdminForm() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const result = await assignAdminRoleAction(formData);

    if (!result.success) {
      setError(result.error || 'Failed to promote user.');
    } else {
      setSuccess(result.message || 'User promoted successfully.');
      (event.target as HTMLFormElement).reset();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Target User UUID"
        name="targetUserId"
        required
        placeholder="00000000-0000-0000-0000-000000000000"
      />
      <Input
        label="Audit Justification / Reason"
        name="reason"
        required
        placeholder="Reason for elevating user to administrator"
      />
      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Admin status grants full platform moderation and database access. Ensure strict identity verification before delegation.
        </span>
      </div>
      <Button
        type="submit"
        variant="primary"
        className="w-full bg-purple-600 hover:bg-purple-700"
        isLoading={loading}
      >
        Authorize & Promote User
      </Button>
    </form>
  );
}
