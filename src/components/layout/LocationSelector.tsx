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
  { city: 'Kano', state: 'Kano', postalCode: '700213', zoneName: 'Nassarawa GRA & State House' },
  { city: 'Kano', state: 'Kano', postalCode: '700241', zoneName: 'Fagge, Kurna & Katsina Rd' },
  { city: 'Kano', state: 'Kano', postalCode: '700211', zoneName: 'Sabon Gari & City Centre' },
  { city: 'Kano', state: 'Kano', postalCode: '700223', zoneName: 'Tarauni, Gyadi-Gyadi & Zoo Rd' },
  { city: 'Kano', state: 'Kano', postalCode: '700221', zoneName: 'Dala, Gwammaja & Goron Dutse' },
  { city: 'Kano', state: 'Kano', postalCode: '700234', zoneName: 'Gwale, Dorayi & BUK Campus' },
  { city: 'Kano', state: 'Kano', postalCode: '700251', zoneName: 'Dawanau Grain Market & Bichi Rd' },
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

    // If currently on home page or marketplace, push directly with new query
    if (pathname === '/' || pathname === '/marketplace') {
      router.push(`${pathname}?${params.toString()}`);
    } else {
      router.push(`/marketplace?${params.toString()}`);
    }
  }

  function handleCustomPostalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (postalInput.trim()) {
      applyLocation(postalInput.trim(), 'Kano');
    } else {
      applyLocation();
    }
  }

  const activeLabel = currentPostal
    ? `ZIP: ${currentPostal}`
    : currentCity
    ? currentCity
    : 'All Kano Areas';

  const mobileLabel = currentPostal
    ? currentPostal
    : currentCity
    ? currentCity
    : 'Kano';

  return (
    <div className="relative shrink-0" ref={modalRef}>
      <button
        id="location-picker-btn"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 inline-flex items-center gap-1 sm:gap-1.5 text-xs font-semibold px-2 sm:px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs"
        aria-label="Select Delivery Location"
        aria-expanded={isOpen}
      >
        <MapPin className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
        <span className="sm:hidden text-slate-800 dark:text-slate-200 text-[11px] font-bold">{mobileLabel}</span>
        <span className="hidden sm:inline max-w-[130px] truncate text-slate-800 dark:text-slate-200">{activeLabel}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          id="location-picker-dropdown"
          className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl p-4 z-50 space-y-4 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Delivery Location
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Filter stores delivering to your Kano neighborhood
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Postal Code Input */}
          <form onSubmit={handleCustomPostalSubmit} className="space-y-2">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Enter Kano Postal Code
            </label>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. 700241 (Fagge/Kurna)"
                  value={postalInput}
                  onChange={(e) => setPostalInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-2 py-1.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-brand-500 focus:outline-none"
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
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Kano Marketplace Zones
            </span>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {/* Option to clear filter */}
              <button
                type="button"
                onClick={() => applyLocation()}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                  !currentPostal && !currentCity
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                }`}
              >
                <span>All Locations (Full Kano Catalog)</span>
                {!currentPostal && !currentCity && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
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
                        ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 font-semibold'
                        : 'border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-slate-900 dark:text-white">{zone.zoneName}</span>
                        {zone.postalCode && (
                          <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300">
                            {zone.postalCode}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {zone.city}, {zone.state}
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />}
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
