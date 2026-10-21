'use client';

import * as React from 'react';
import { removeShoppingListItemAction } from '@/app/lists/actions';
import { Trash2, Loader2 } from 'lucide-react';

export function DeleteListItemButton({
  itemId,
  listId,
}: {
  itemId: string;
  listId: string;
}) {
  const [loading, setLoading] = React.useState(false);

  async function handleDelete() {
    setLoading(true);
    await removeShoppingListItemAction(itemId, listId);
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      aria-label="Remove item from list"
      className="p-1 text-slate-400 hover:text-red-600 transition-colors rounded-lg disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
