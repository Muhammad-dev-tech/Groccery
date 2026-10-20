'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { adminUpdateStoreStatusAction } from '@/app/admin/stores/actions';
import { CheckCircle2, PauseCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import type { StoreStatus } from '@/types/database.types';

export interface AdminStoreRow {
  id: string;
  name: string;
  owner_id: string;
  ownerName: string;
  contact_email: string;
  contact_phone: string;
  city: string;
  state: string;
  status: StoreStatus;
  created_at: string;
}

interface StoreModerationTableProps {
  stores: AdminStoreRow[];
}

export function StoreModerationTable({ stores }: StoreModerationTableProps) {
  const [selectedStore, setSelectedStore] = React.useState<AdminStoreRow | null>(null);
  const [targetStatus, setTargetStatus] = React.useState<StoreStatus | null>(null);
  const [reason, setReason] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ text: string; isError: boolean } | null>(null);

  async function handleStatusChange(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStore || !targetStatus) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('storeId', selectedStore.id);
    formData.append('newStatus', targetStatus);
    formData.append('reason', reason || `Administrative action: set to ${targetStatus}`);

    const res = await adminUpdateStoreStatusAction(formData);
    if (!res.success) {
      setMessage({ text: res.error || 'Failed to update store status', isError: true });
    } else {
      setMessage({ text: res.message || 'Status updated successfully', isError: false });
      setSelectedStore(null);
      setTargetStatus(null);
      setReason('');
      window.location.reload();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            message.isError
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {message.isError ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Moderation Action Modal / Form when action clicked */}
      {selectedStore && targetStatus && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-slate-900">
              Confirm Status Change: {selectedStore.name} → <span className="uppercase text-brand-700">{targetStatus}</span>
            </span>
            <button
              onClick={() => {
                setSelectedStore(null);
                setTargetStatus(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleStatusChange} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Audit Reason / Justification
              </label>
              <input
                type="text"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Identity verified, business license on file"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStore(null);
                  setTargetStatus(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={loading}>
                Confirm Status Transition
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3">Store</th>
              <th className="py-2.5 px-3">Owner</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Applied</th>
              <th className="py-2.5 px-3 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stores.length > 0 ? (
              stores.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    <div>{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{s.contact_phone}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-slate-800">{s.ownerName}</div>
                    <div className="text-[10px] text-slate-400">{s.contact_email}</div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {s.city}, {s.state}
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge
                      variant={
                        s.status === 'approved'
                          ? 'success'
                          : s.status === 'pending'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {s.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {s.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-7 px-2"
                            onClick={() => {
                              setSelectedStore(s);
                              setTargetStatus('approved');
                              setReason('Store details verified; approved for platform listing.');
                            }}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            className="text-[11px] h-7 px-2"
                            onClick={() => {
                              setSelectedStore(s);
                              setTargetStatus('rejected');
                              setReason('Failed initial verification criteria.');
                            }}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}

                      {s.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-700 border-amber-300 hover:bg-amber-50 text-[11px] h-7 px-2"
                          onClick={() => {
                            setSelectedStore(s);
                            setTargetStatus('suspended');
                            setReason('Temporary suspension pending store audit.');
                          }}
                        >
                          <PauseCircle className="w-3 h-3 mr-1" /> Suspend
                        </Button>
                      )}

                      {s.status === 'suspended' && (
                        <Button
                          size="sm"
                          className="bg-brand-600 hover:bg-brand-700 text-white text-[11px] h-7 px-2"
                          onClick={() => {
                            setSelectedStore(s);
                            setTargetStatus('approved');
                            setReason('Audit completed; store reinstated to active status.');
                          }}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Reinstate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No vendor store onboarding requests submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
