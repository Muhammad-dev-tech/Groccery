'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createShoppingListAction } from '@/app/lists/actions';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Loader2 } from 'lucide-react';

export function CreateListForm() {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', title.trim());

    const result = await createShoppingListAction(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setTitle('');
    setLoading(false);
    if (result.listId) {
      router.push(`/lists/${result.listId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-3 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="list-title" className="block text-xs font-semibold text-slate-700 mb-1">
          List Title *
        </label>
        <input
          id="list-title"
          type="text"
          required
          placeholder="e.g. Weekly Pantry, Party Groceries"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={loading || !title.trim()}
        className="w-full flex items-center justify-center gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating...
          </>
        ) : (
          <>
            <PlusCircle className="w-3.5 h-3.5" /> Create List
          </>
        )}
      </Button>
    </form>
  );
}
