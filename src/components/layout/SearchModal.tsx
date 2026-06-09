'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { SearchPreviewResult } from '@/lib/types';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-accent/30 text-accent">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function SearchModal({ open, onClose }: SearchModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchPreviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setQuery('');
    setResult(null);
    setLoading(false);
    setError(null);
    onClose();
  }, [onClose]);

  // Auto-focus on open
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleClose]);

  // Debounced search
  useEffect(() => {
    if (!open || query.trim().length < 2) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&mode=preview`);
        if (!res.ok) throw new Error('搜索请求失败');
        const data: SearchPreviewResult = await res.json();
        if (!cancelled) setResult(data);
      } catch {
        if (!cancelled) {
          setError('搜索出错，请稍后重试');
          setResult(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) handleClose();
    },
    [handleClose],
  );

  if (!open) return null;

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length >= 2;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg-dark/90 pt-[15vh] backdrop-blur-sm transition-all duration-300"
      onClick={handleOverlayClick}
    >
      <div className="w-full max-w-2xl px-6">
        {/* Search input */}
        <div className="relative border-b border-border-gold">
          <svg
            className="absolute top-1/2 left-0 h-5 w-5 -translate-y-1/2 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索全站内容..."
            className="w-full border-none bg-transparent py-4 pl-8 pr-16 font-heading text-xl text-text-primary outline-none placeholder:text-text-muted"
          />
          <span className="absolute top-1/2 right-0 hidden -translate-y-1/2 rounded border border-border-gold px-2 py-0.5 text-xs text-text-muted md:inline-block">
            ESC
          </span>
        </div>

        {/* Results area */}
        <div className="mt-4 max-h-[50vh] overflow-y-auto">
          {/* Hint when query too short */}
          {!hasQuery && trimmedQuery.length > 0 && (
            <p className="py-8 text-center text-sm text-text-muted">输入至少 2 个字符开始搜索</p>
          )}

          {/* Empty state */}
          {!hasQuery && trimmedQuery.length === 0 && (
            <p className="py-8 text-center text-sm text-text-muted">
              输入关键词搜索动态、影视、演出、活动等内容
            </p>
          )}

          {/* Loading */}
          {loading && hasQuery && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
            </div>
          )}

          {/* Error */}
          {error && !loading && <p className="py-8 text-center text-sm text-red-400">{error}</p>}

          {/* Results */}
          {!loading && !error && hasQuery && result && (
            <>
              {result.totalCount === 0 ? (
                <p className="py-8 text-center text-sm text-text-muted">
                  未找到与 &ldquo;{trimmedQuery}&rdquo; 相关的内容
                </p>
              ) : (
                <div className="space-y-6">
                  {result.groups.map((group) => (
                    <div key={group.type}>
                      <h3 className="mb-3 font-heading text-xs tracking-widest text-text-muted uppercase">
                        {group.typeLabel}
                        <span className="ml-2 text-accent">{group.totalCount}</span>
                      </h3>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={`${item.type}-${item.id}`}>
                            <Link
                              href={item.url}
                              onClick={handleClose}
                              className="group flex flex-col gap-1 rounded-[var(--radius-card)] border border-transparent px-3 py-2.5 transition-all duration-200 hover:border-border-gold hover:bg-bg-dark/80"
                            >
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                                  {item.typeLabel}
                                </span>
                                <span className="truncate font-body text-sm text-text-primary group-hover:text-accent">
                                  {highlightText(item.title, trimmedQuery)}
                                </span>
                                {item.date && (
                                  <span className="ml-auto shrink-0 text-xs text-text-muted">
                                    {item.date}
                                  </span>
                                )}
                              </div>
                              {item.snippet && (
                                <p className="line-clamp-1 pl-0.5 text-xs text-text-secondary">
                                  {highlightText(item.snippet, trimmedQuery)}
                                </p>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}

                  {/* View all results */}
                  <div className="border-t border-border-gold/30 pt-4 pb-2 text-center">
                    <Link
                      href={`/search?q=${encodeURIComponent(trimmedQuery)}`}
                      onClick={handleClose}
                      className="inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-accent/80"
                    >
                      查看全部 {result.totalCount} 条结果
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
