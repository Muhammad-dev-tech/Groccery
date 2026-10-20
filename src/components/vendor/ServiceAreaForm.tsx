'use client';

import * as React from 'react';
import { useActionState } from 'react';
import { addServiceAreaAction, type ActionState } from '@/app/vendor/service-areas/actions';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Loader2 } from 'lucide-react';

interface ServiceAreaFormProps {
  defaultCity: string;
  defaultState: string;
  disabled?: boolean;
}

export function ServiceAreaForm({ defaultCity, defaultState, disabled }: ServiceAreaFormProps) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    addServiceAreaAction,
    {}
  );
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.error && (
        <div className="p-3 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="p-3 text-xs rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
          Service zone successfully registered!
        </div>
      )}

      <div>
        <label htmlFor="zoneName" className="block text-xs font-semibold text-slate-700 mb-1">
          Zone / Neighborhood Name *
        </label>
        <input
          id="zoneName"
          name="zoneName"
          type="text"
          required
          disabled={disabled || isPending}
          placeholder="e.g. Downtown, North Shore"
          className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          A recognizable neighborhood or delivery sector name.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="city" className="block text-xs font-semibold text-slate-700 mb-1">
            City *
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            defaultValue={defaultCity}
            disabled={disabled || isPending}
            className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-xs font-semibold text-slate-700 mb-1">
            State / Region *
          </label>
          <input
            id="state"
            name="state"
            type="text"
            required
            defaultValue={defaultState}
            disabled={disabled || isPending}
            className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="postalCode" className="block text-xs font-semibold text-slate-700 mb-1">
          Postal / ZIP Code (Recommended)
        </label>
        <input
          id="postalCode"
          name="postalCode"
          type="text"
          disabled={disabled || isPending}
          placeholder="e.g. 62701, SW1A 1AA"
          className="w-full rounded-xl border border-slate-200 py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Enables exact postal code match in customer location search.
        </p>
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={disabled || isPending}
        className="w-full flex items-center justify-center gap-1.5 mt-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <PlusCircle className="w-3.5 h-3.5" /> Add Delivery Zone
          </>
        )}
      </Button>
    </form>
  );
}
