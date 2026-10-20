'use client';

import * as React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CategoryOption {
  id: string;
  name: string;
  icon: string | null;
}

interface VendorOption {
  id: string;
  name: string;
  city: string;
}

interface SearchFiltersProps {
  categories: CategoryOption[];
  vendors: VendorOption[];
}

export function SearchFilters({ categories, vendors }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentQuery = searchParams.get('query') || '';
  const currentCategory = searchParams.get('categoryId') || '';
  const currentVendor = searchParams.get('vendorId') || '';
  const currentMinPrice = searchParams.get('minPrice') || '';
  const currentMaxPrice = searchParams.get('maxPrice') || '';
  const currentInStock = searchParams.get('inStockOnly') === 'true';
  const currentSort = searchParams.get('sort') || 'relevance';

  const [searchTerm, setSearchTerm] = React.useState(currentQuery);
  const [minPrice, setMinPrice] = React.useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = React.useState(currentMaxPrice);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // Sync state if URL changes externally
  React.useEffect(() => {
    setSearchTerm(currentQuery);
    setMinPrice(currentMinPrice);
    setMaxPrice(currentMaxPrice);
  }, [currentQuery, currentMinPrice, currentMaxPrice]);

  function updateFilter(updates: Record<string, string | number | null | boolean>) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to page 1 on filter changes

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilter({ query: searchTerm.trim() || null });
  }

  function handlePriceFilterSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateFilter({
      minPrice: minPrice ? Number(minPrice) : null,
      maxPrice: maxPrice ? Number(maxPrice) : null,
    });
  }

  function clearAllFilters() {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    router.push(pathname);
  }

  const currentPostal = searchParams.get('postalCode') || '';
  const currentCity = searchParams.get('city') || '';

  const hasActiveFilters = Boolean(
    currentQuery || currentCategory || currentVendor || currentMinPrice || currentMaxPrice || currentInStock || currentSort !== 'relevance' || currentPostal || currentCity
  );

  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by grocery name or description (e.g. Basmati Rice, Olive Oil)..."
          className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
        />
        <div className="absolute right-1.5 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                updateFilter({ query: null });
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <Button type="submit" size="sm" className="h-8 px-3 text-xs">
            Search
          </Button>
        </div>
      </form>

      {/* Primary Category Quick-Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => updateFilter({ categoryId: null })}
          className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
            !currentCategory
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          All Aisles
        </button>
        {categories.map((c) => {
          const isSelected = currentCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => updateFilter({ categoryId: isSelected ? null : c.id })}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-brand-300 hover:bg-brand-50/40'
              }`}
            >
              {c.icon && <span>{c.icon}</span>}
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sorting & Filter Summary Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* Availability checkbox */}
          <label className="hidden sm:inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={currentInStock}
              onChange={(e) => updateFilter({ inStockOnly: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>In Stock Only</span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-700 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 hidden sm:inline">Sort:</span>
          <select
            value={currentSort}
            onChange={(e) => updateFilter({ sort: e.target.value })}
            className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="relevance">Transparent Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Expandable Advanced Filter Drawer (Price Range & Vendor filter) */}
      <div className={`pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${showMobileFilters ? 'block' : 'hidden md:grid'}`}>
        {/* Vendor Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
            Filter by Store / Vendor
          </label>
          <select
            value={currentVendor}
            onChange={(e) => updateFilter({ vendorId: e.target.value || null })}
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Approved Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.city})
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <form onSubmit={handlePriceFilterSubmit} className="sm:col-span-2 flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Min Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="0.00"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Max Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="50.00"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-8 text-xs shrink-0">
            Apply Range
          </Button>
        </form>
      </div>
    </div>
  );
}
