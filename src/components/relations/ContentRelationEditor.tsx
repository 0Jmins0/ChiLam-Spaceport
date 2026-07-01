'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useEditMode } from '@/components/edit/EditModeProvider';
import { CONTENT_TYPE_LABELS, type RelatedContentSummary } from '@/lib/content-types';

interface ContentRelationEditorProps {
  sourceType: string;
  sourceId: string;
  allowedTargets?: string[];
}

type SearchResult = {
  type: string;
  typeLabel: string;
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
};

const defaultTargets = [
  'production',
  'performance',
  'endorsement',
  'livestream',
  'interview',
  'album',
  'magazine',
];

export function ContentRelationEditor({
  sourceType,
  sourceId,
  allowedTargets = defaultTargets,
}: ContentRelationEditorProps) {
  const { editMode, adminToken } = useEditMode();
  const router = useRouter();
  const [relations, setRelations] = useState<RelatedContentSummary[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [relationType, setRelationType] = useState('related');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editMode || !adminToken) return;

    fetch(`/api/admin/content-relations?sourceType=${sourceType}&sourceId=${sourceId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => setRelations(payload?.data ?? []))
      .catch(() => undefined);
  }, [editMode, adminToken, sourceType, sourceId]);

  useEffect(() => {
    if (!editMode || !adminToken || !query.trim()) {
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams({
        q: query.trim(),
        types: allowedTargets.join(','),
      });
      fetch(`/api/admin/content-search?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((payload) => setResults(payload?.data ?? []))
        .finally(() => setLoading(false));
    }, 250);
  }, [allowedTargets, adminToken, editMode, query]);

  if (!editMode || !adminToken) return null;

  const addRelation = async (target: SearchResult) => {
    const res = await fetch('/api/admin/content-relations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sourceType,
        sourceId,
        targetType: target.type,
        targetId: target.id,
        relationType,
      }),
    });

    if (res.ok) {
      setQuery('');
      setResults([]);
      router.refresh();
      const payload = await fetch(
        `/api/admin/content-relations?sourceType=${sourceType}&sourceId=${sourceId}`,
        { headers: { Authorization: `Bearer ${adminToken}` } },
      ).then((response) => (response.ok ? response.json() : null));
      setRelations(payload?.data ?? []);
    }
  };

  const removeRelation = async (relationId?: string) => {
    if (!relationId) return;
    const res = await fetch('/api/admin/content-relations', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ id: relationId }),
    });

    if (res.ok) {
      setRelations((items) => items.filter((item) => item.relationId !== relationId));
      router.refresh();
    }
  };

  return (
    <section className="mt-8 border border-border-gold bg-bg-dark/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-text-primary">关联内容</h2>
          <p className="mt-1 text-xs text-text-muted">把当前动态关联到作品、演出、活动或资料库。</p>
        </div>
        <select
          value={relationType}
          onChange={(event) => setRelationType(event.target.value)}
          className="rounded border border-border-gold/40 bg-bg-darker px-2 py-1 text-xs text-text-primary"
        >
          <option value="related">相关</option>
          <option value="about">关于</option>
          <option value="promotion_of">宣传</option>
          <option value="sighting_of">路透属于</option>
        </select>
      </div>

      {relations.length > 0 && (
        <div className="mb-4 space-y-2">
          {relations.map((item) => (
            <div
              key={item.relationId ?? `${item.type}-${item.id}`}
              className="flex items-center justify-between gap-3 border border-border-gold/30 bg-bg-darker/60 px-3 py-2"
            >
              <Link href={item.url} className="min-w-0 text-sm text-text-primary hover:text-accent">
                <span className="truncate">{item.title}</span>
                <span className="ml-2 text-xs text-text-muted">
                  {CONTENT_TYPE_LABELS[item.type] ?? item.type}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => removeRelation(item.relationId)}
                className="shrink-0 text-xs text-text-muted transition-colors hover:text-red-300"
              >
                解除
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          if (!value.trim()) setResults([]);
        }}
        placeholder="搜索要关联的内容"
        className="w-full rounded border border-border-gold/40 bg-bg-darker px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
      />

      {(loading || results.length > 0) && (
        <div className="mt-2 max-h-64 overflow-y-auto border border-border-gold/30 bg-bg-darker">
          {loading && <p className="p-3 text-xs text-text-muted">搜索中...</p>}
          {results.map((item) => (
            <button
              key={`${item.type}-${item.id}`}
              type="button"
              onClick={() => addRelation(item)}
              className={cn(
                'flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors',
                'hover:bg-accent/10',
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-text-primary">{item.title}</span>
                {item.subtitle && (
                  <span className="block text-xs text-text-muted">{item.subtitle}</span>
                )}
              </span>
              <span className="shrink-0 text-xs text-accent">{item.typeLabel}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
