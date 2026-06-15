'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEditMode } from '@/components/edit/EditModeProvider';

interface LinkedProductionProps {
  performanceSlug: string;
  linkedProduction: { id: string; title: string; slug: string; type: string } | null;
}

interface SearchResult {
  id: string;
  title: string;
  titleEn: string | null;
  slug: string;
  year: number | null;
}

export function LinkedProduction({ performanceSlug, linkedProduction }: LinkedProductionProps) {
  const { editMode } = useEditMode();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/productions/search?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.data || []);
          setShowDropdown(true);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLink = async (productionId: string) => {
    try {
      const res = await fetch(`/api/performances/${performanceSlug}/relation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productionId }),
      });
      if (res.ok) {
        setQuery('');
        setShowDropdown(false);
        router.refresh();
      }
    } catch {
      // silently fail
    }
  };

  const handleUnlink = async () => {
    if (!linkedProduction) return;
    try {
      const res = await fetch(`/api/performances/${performanceSlug}/relation`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productionId: linkedProduction.id }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail
    }
  };

  // Non-edit mode
  if (!editMode) {
    if (!linkedProduction) return null;
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-accent">综艺节目：</span>
        <Link
          href={`/screens/${linkedProduction.slug}`}
          className="text-sm text-text-primary underline transition-colors hover:text-accent"
        >
          {linkedProduction.title}
        </Link>
      </div>
    );
  }

  // Edit mode
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-accent">综艺节目：</span>
      {linkedProduction ? (
        <div className="flex items-center gap-2">
          <Link
            href={`/screens/${linkedProduction.slug}`}
            className="text-sm text-text-primary underline transition-colors hover:text-accent"
          >
            {linkedProduction.title}
          </Link>
          <button
            onClick={handleUnlink}
            className="text-xs text-red-400 transition-colors hover:text-red-300"
          >
            解除关联
          </button>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="搜索综艺名称..."
            className="rounded border border-border-gold/30 bg-bg-darker px-2 py-1 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent/50"
          />
          {loading && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted">
              ...
            </span>
          )}
          {showDropdown && results.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-48 w-64 overflow-y-auto rounded border border-border-gold/30 bg-bg-card shadow-lg">
              {results.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLink(item.id)}
                  className="block w-full px-3 py-2 text-left text-sm text-text-primary transition-colors hover:bg-white/5"
                >
                  {item.title}
                  {item.year && <span className="ml-1 text-xs text-text-muted">({item.year})</span>}
                </button>
              ))}
            </div>
          )}
          {showDropdown && results.length === 0 && query.trim() && !loading && (
            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded border border-border-gold/30 bg-bg-card px-3 py-2 text-xs text-text-muted shadow-lg">
              未找到匹配的综艺节目
            </div>
          )}
        </div>
      )}
    </div>
  );
}
