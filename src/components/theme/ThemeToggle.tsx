'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 ${className}`} />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 
        ${
          isDark
            ? 'bg-slate-900/90 border-slate-700 text-amber-400 hover:bg-slate-800 hover:text-amber-300 shadow-sm'
            : 'bg-white/90 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
        } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-slate-700" />
      )}
    </button>
  );
}
