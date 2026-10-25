'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight } from 'lucide-react';

export function HeroSearchForm() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPostal, setSelectedPostal] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    }
    if (selectedPostal) {
      params.set('postalCode', selectedPostal);
    }
    router.push(`/marketplace?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-2xl mx-auto p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 transition-shadow hover:shadow-md"
    >
      <div className="flex-1 flex items-center px-3.5 gap-2.5 min-w-0">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search rice, cooking oil, flour, produce..."
          className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none py-2"
        />
      </div>

      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />

      <div className="flex items-center px-3 gap-2 min-w-0 sm:w-44">
        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <select
          value={selectedPostal}
          onChange={(e) => setSelectedPostal(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-600 dark:text-slate-300 focus:outline-none py-2 cursor-pointer truncate"
        >
          <option value="" className="dark:bg-slate-900">All Kano</option>
          <option value="700213" className="dark:bg-slate-900">Nassarawa GRA</option>
          <option value="700241" className="dark:bg-slate-900">Fagge / Kurna</option>
          <option value="700211" className="dark:bg-slate-900">Sabon Gari</option>
          <option value="700223" className="dark:bg-slate-900">Tarauni</option>
          <option value="700282" className="dark:bg-slate-900">Dala</option>
        </select>
      </div>

      <button
        type="submit"
        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
      >
        <span>Search</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </form>
  );
}
