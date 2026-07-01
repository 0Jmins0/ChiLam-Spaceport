'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useEditMode } from '@/components/edit/EditModeProvider';
import { UpdateItemVisibilityToggle } from './UpdateItemVisibilityToggle';

type UpdateType = 'social' | 'news' | 'sighting';

type AdminItem = {
  id: string;
  slug?: string;
  title?: string | null;
  summary?: string | null;
  platform?: string;
  source?: string | null;
  authorName?: string;
  publishedAt?: string | null;
  sightedAt?: string | null;
  isVisible: boolean;
};

const typeLabels: Record<UpdateType, string> = {
  social: '社交媒体',
  news: '新闻',
  sighting: '路透',
};

function getItemHref(type: UpdateType, item: AdminItem) {
  if (type === 'social') return `/updates/social/${item.id}`;
  if (type === 'news') return `/updates/news/${item.slug}`;
  return `/updates/sightings/${item.slug}`;
}

function getSubtitle(type: UpdateType, item: AdminItem) {
  if (type === 'social') return item.platform ?? '社交媒体';
  if (type === 'news') return item.source ?? '新闻';
  return item.authorName ?? '路透';
}

export function UpdatesAdminPanel({ currentTab }: { currentTab: string }) {
  const { editMode, adminToken } = useEditMode();
  const type: UpdateType = useMemo(() => {
    if (currentTab === 'news') return 'news';
    if (currentTab === 'sighting') return 'sighting';
    return 'social';
  }, [currentTab]);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editMode || !adminToken) return;

    let cancelled = false;
    async function loadItems() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/updates/items?type=${type}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const payload = res.ok ? await res.json() : null;
        if (!cancelled) setItems(payload?.data ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [editMode, adminToken, type]);

  if (!editMode || !adminToken) return null;

  return (
    <section className="mb-8 border border-border-gold bg-bg-dark/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-text-primary">{typeLabels[type]}内容开关</h2>
          <p className="mt-1 text-xs text-text-muted">这里会显示前台隐藏的内容，便于逐条维护。</p>
        </div>
      </div>

      {loading ? (
        <p className="py-4 text-xs text-text-muted">读取中...</p>
      ) : items.length === 0 ? (
        <p className="py-4 text-xs text-text-muted">暂无内容</p>
      ) : (
        <div className="divide-y divide-border-gold/20">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 py-2">
              <div className="min-w-0">
                <Link
                  href={getItemHref(type, item)}
                  className="block truncate text-sm text-text-primary transition-colors hover:text-accent"
                >
                  {item.title || item.summary || '未命名内容'}
                </Link>
                <p className="mt-0.5 text-xs text-text-muted">{getSubtitle(type, item)}</p>
              </div>
              <UpdateItemVisibilityToggle
                type={type}
                id={item.id}
                isVisible={item.isVisible}
                onChange={(isVisible) =>
                  setItems((current) =>
                    current.map((entry) =>
                      entry.id === item.id ? { ...entry, isVisible } : entry,
                    ),
                  )
                }
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
