'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { MapPin, ChevronDown, Check, X, Search } from 'lucide-react';

interface ZoneOption {
  city: string;
  state: string;
  postalCode: string | null;
  zoneName: string;
}

const COMMON_ZONES: ZoneOption[] = [
  { city: 'Springfield', state: 'IL', postalCode: '62701', zoneName: 'Downtown & Capitol District' },
  { city: 'Springfield', state: 'IL', postalCode: '62702', zoneName: 'North End & Eastside' },
  { city: 'Springfield', state: 'IL', postalCode: '62704', zoneName: 'Westside & Laketown' },
  { city: 'Chicago', state: 'IL', postalCode: '60601', zoneName: 'The Loop & River North' },
  { city: 'Chicago', state: 'IL', postalCode: '60607', zoneName: 'West Loop & Fulton Market' },
];

export function LocationSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPostal = searchParams.get('postalCode') || '';
  const currentCity = searchParams.get('city') || '';

  const [isOpen, setIsOpen] = React.useState(false);
  const [postalInput, setPostalInput] = React.useState(currentPostal);
  const modalRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setPostalInput(currentPostal);
  }, [currentPostal]);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function applyLocation(postal?: string, city?: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (postal) {
      params.set('postalCode', postal.trim().toUpperCase());
    } else {
      params.delete('postalCode');
    }

    if (city) {
      params.set('city', city.trim());
    } else {
      params.delete('city');
    }

    setIsOpen(false);

    // If currently on marketplace page, update params; otherwise navigate to /marketplace
    if (pathname === '/marketplace') {
      router.push(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/marketplace?${params.toString()}`);
    }
  }

  function handleCustomPostalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!postalInput.trim()) {
      applyLocation();
    } else {
      applyLocation(postalInput);
    }
  }

  const activeLabel = currentPostal
    ? `ZIP: ${currentPostal}`
    : currentCity
    ? currentCity
    : 'All Locations';

  return (
    <div className="relative" ref={modalRef}>
      <button
        id="location-picker-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
        aria-label="Select Delivery Location"
        aria-expanded={isOpen}
      >
        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
        <span className="max-w-[120px] truncate text-slate-800">{activeLabel}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div
          id="location-picker-dropdown"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 rounded-2xl bg-white border border-slate-200/90 shadow-xl p-4 z-50 space-y-4 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Delivery Location
              </h3>
              <p className="text-[11px] text-slate-500">
                Only show vendors that deliver to your area
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Postal Code Input */}
          <form onSubmit={handleCustomPostalSubmit} className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-700">
              Enter Postal / ZIP Code
            </label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 700213, 700241"
                  value={postalInput}
                  onChange={(e) => setPostalInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-2 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 shrink-0"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Active Verified Zones Selection */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Marketplace Zones
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {/* Option to clear filter */}
              <button
                type="button"
                onClick={() => applyLocation()}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  !currentPostal && !currentCity
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>All Locations (Full Catalog)</span>
                {!currentPostal && !currentCity && <Check className="w-3.5 h-3.5 text-brand-600" />}
              </button>

              {COMMON_ZONES.map((zone) => {
                const isSelected = currentPostal === zone.postalCode;
                return (
                  <button
                    key={`${zone.city}-${zone.postalCode}`}
                    type="button"
                    onClick={() => applyLocation(zone.postalCode || undefined, zone.city)}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-brand-50 border border-brand-200 text-brand-800 font-semibold'
                        : 'border border-transparent hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900">{zone.zoneName}</span>
                        {zone.postalCode && (
                          <span className="font-mono text-[10px] bg-slate-100 px-1 rounded text-slate-600">
                            {zone.postalCode}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {zone.city}, {zone.state}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
