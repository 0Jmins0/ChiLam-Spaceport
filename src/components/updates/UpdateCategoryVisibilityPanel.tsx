'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { useEditMode } from '@/components/edit/EditModeProvider';

type CategoryState = {
  key: string;
  slug: string;
  label: string;
  isVisible: boolean;
};

export function UpdateCategoryVisibilityPanel() {
  const { editMode, adminToken } = useEditMode();
  const [categories, setCategories] = useState<CategoryState[]>([]);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!editMode || !adminToken) return;

    fetch('/api/admin/updates/categories', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (payload?.data) setCategories(payload.data);
      })
      .catch(() => undefined);
  }, [editMode, adminToken]);

  if (!editMode || !adminToken) return null;

  const toggle = async (category: CategoryState) => {
    const next = !category.isVisible;
    setLoadingSlug(category.slug);

    try {
      const res = await fetch('/api/admin/updates/categories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ slug: category.slug, isVisible: next }),
      });
      if (!res.ok) throw new Error('更新失败');
      setCategories((items) =>
        items.map((item) => (item.slug === category.slug ? { ...item, isVisible: next } : item)),
      );
    } finally {
      setLoadingSlug(null);
    }
  };

  return (
    <section className="mb-6 border border-border-gold bg-bg-dark/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-text-primary">动态栏目开关</h2>
          <p className="mt-1 text-xs text-text-muted">控制普通前台是否展示动态整体和下方大标题。</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => toggle(category)}
            disabled={loadingSlug === category.slug}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors',
              category.isVisible
                ? 'border-green-500/40 bg-green-500/10 text-green-300'
                : 'border-white/15 bg-white/5 text-text-muted',
              loadingSlug === category.slug && 'cursor-wait opacity-60',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                category.isVisible ? 'bg-green-300' : 'bg-text-muted',
              )}
            />
            {category.label}
            <span className="text-[10px]">{category.isVisible ? '前台显示' : '前台隐藏'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
