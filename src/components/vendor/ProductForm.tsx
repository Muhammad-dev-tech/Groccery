'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { createProductAction, updateProductAction, type ProductActionResult } from '@/app/vendor/products/actions';
import { PlusCircle, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import type { UnitOfMeasure } from '@/types/database.types';

interface CategoryOption {
  id: string;
  name: string;
  icon: string | null;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    categoryId: string;
    price: number;
    currency: string;
    packageQuantity: number;
    unitOfMeasurement: UnitOfMeasure;
    stockQuantity: number;
    isAvailable: boolean;
    imageUrl?: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProductForm({ categories, initialData, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const isEditing = Boolean(initialData);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    if (isEditing && initialData) {
      formData.append('id', initialData.id);
    }

    const result: ProductActionResult = isEditing
      ? await updateProductAction(formData)
      : await createProductAction(formData);

    if (!result.success) {
      setError(result.error || 'Failed to save product.');
    } else {
      setSuccess(result.message || 'Product saved successfully!');
      if (!isEditing) {
        (event.target as HTMLFormElement).reset();
      }
      if (onSuccess) {
        setTimeout(onSuccess, 1000);
      }
    }
    setLoading(false);
  }

  return (
    <Card className="border-slate-200 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">
          {isEditing ? 'Edit Grocery Product' : 'Add New Grocery Product'}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? 'Update pricing, inventory stock, or package specification.'
            : 'Publish a new item to your store catalog with verified units.'}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Input
                label="Product Name"
                name="name"
                required
                defaultValue={initialData?.name || ''}
                placeholder="e.g. Organic Basmati Rice 1kg"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Aisle / Category
              </label>
              <select
                name="categoryId"
                required
                defaultValue={initialData?.categoryId || ''}
                className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="" disabled>Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon ? `${c.icon} ` : ''}{c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows={2}
                defaultValue={initialData?.description || ''}
                placeholder="Nutritional notes, origin, or key details..."
                className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <Input
                label="Listed Price ($)"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={initialData?.price ?? ''}
                placeholder="4.99"
              />
            </div>

            <div>
              <Input
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                step="1"
                min="0"
                required
                defaultValue={initialData?.stockQuantity ?? 50}
                placeholder="50"
              />
            </div>

            <div>
              <Input
                label="Package Size / Quantity"
                name="packageQuantity"
                type="number"
                step="0.001"
                min="0.001"
                required
                defaultValue={initialData?.packageQuantity ?? 1}
                placeholder="e.g. 1 or 500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Unit of Measurement
              </label>
              <select
                name="unitOfMeasurement"
                required
                defaultValue={initialData?.unitOfMeasurement || 'kg'}
                className="flex w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="kg">kg (Kilogram - Mass)</option>
                <option value="g">g (Gram - Mass)</option>
                <option value="l">l (Litre - Volume)</option>
                <option value="ml">ml (Millilitre - Volume)</option>
                <option value="piece">piece (Discrete Count)</option>
                <option value="pack">pack (Packaged Bundle)</option>
                <option value="bundle">bundle (Produce Bundle)</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Input
                label="Product Image URL (Optional)"
                name="imageUrl"
                type="url"
                defaultValue={initialData?.imageUrl || ''}
                placeholder="https://images.unsplash.com/..."
                helperText="Paste a secure public image URL or Supabase storage link"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                defaultChecked={initialData?.isAvailable ?? true}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="isAvailable" className="text-xs font-medium text-slate-700">
                Mark as active & available for customer discovery and ordering
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={loading}>
              <PlusCircle className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Product Changes' : 'Create & Publish Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
