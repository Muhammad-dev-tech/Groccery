'use client';

import * as React from 'react';
import { deleteServiceAreaAction } from '@/app/vendor/service-areas/actions';
import { MapPin, Trash2, Loader2, Navigation, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ServiceAreaRecord {
  id: string;
  vendor_id: string;
  city: string;
  state: string;
  zone_name: string;
  postal_code: string | null;
  created_at: string;
}

interface ServiceAreaListProps {
  serviceAreas: ServiceAreaRecord[];
  disabled?: boolean;
}

export function ServiceAreaList({ serviceAreas, disabled }: ServiceAreaListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to remove delivery coverage for "${name}"?`)) {
      return;
    }

    setDeletingId(id);
    setErrorMsg(null);
    try {
      const res = await deleteServiceAreaAction(id);
      if (res.error) {
        setErrorMsg(res.error);
      }
    } catch {
      setErrorMsg('An unexpected error occurred while deleting the zone.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="p-3 text-xs rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Active Delivery Zones</h2>
          <p className="text-xs text-slate-500">
            {serviceAreas.length} zone{serviceAreas.length === 1 ? '' : 's'} registered
          </p>
        </div>
      </div>

      {serviceAreas.length === 0 ? (
        <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <Navigation className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-800">No specific zones registered yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Adding postal codes and neighborhood zones allows customers in those areas to discover your store and order directly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviceAreas.map((area) => (
            <div
              key={area.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:border-brand-200 transition-colors flex items-start justify-between gap-3"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-slate-900 truncate">
                    {area.zone_name}
                  </span>
                  {area.postal_code && (
                    <Badge variant="brand" className="text-[11px] font-mono">
                      {area.postal_code}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {area.city}, {area.state}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(area.id, area.zone_name)}
                disabled={disabled || deletingId === area.id}
                aria-label={`Remove zone ${area.zone_name}`}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0 disabled:opacity-50"
              >
                {deletingId === area.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
