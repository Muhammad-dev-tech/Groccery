'use client';

import * as React from 'react';
import { addShoppingListItemAction } from '@/app/lists/actions';
import { Button } from '@/components/ui/Button';
import { Plus, Loader2 } from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
}

export function AddListItemForm({
  listId,
  categories,
}: {
  listId: string;
  categories: CategoryOption[];
}) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('listId', listId);

    const res = await addShoppingListItemAction(formData);
    if (res.error) {
      setError(res.error);
    } else {
      formRef.current?.reset();
    }
    setLoading(false);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="p-2.5 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="itemName" className="block text-xs font-semibold text-slate-700 mb-1">
          Item Name / Grocery Product *
        </label>
        <input
          id="itemName"
          name="itemName"
          type="text"
          required
          placeholder="e.g. Royal Basmati Rice, Whole Milk, Gala Apples"
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="categoryId" className="block text-xs font-semibold text-slate-700 mb-1">
            Category (Optional)
          </label>
          <select
            id="categoryId"
            name="categoryId"
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 py-2 px-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none bg-white"
          >
            <option value="">Any Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label htmlFor="targetQuantity" className="block text-xs font-semibold text-slate-700 mb-1">
              Qty
            </label>
            <input
              id="targetQuantity"
              name="targetQuantity"
              type="number"
              min="0.1"
              step="0.5"
              defaultValue="1"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 py-2 px-2 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="targetUnit" className="block text-xs font-semibold text-slate-700 mb-1">
              Unit
            </label>
            <select
              id="targetUnit"
              name="targetUnit"
              defaultValue="piece"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 py-2 px-1 text-xs text-slate-800 focus:border-brand-500 focus:outline-none bg-white"
            >
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="l">L</option>
              <option value="ml">mL</option>
              <option value="piece">pc</option>
              <option value="pack">pack</option>
            </select>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" /> Add to List
          </>
        )}
      </Button>
    </form>
  );
}
