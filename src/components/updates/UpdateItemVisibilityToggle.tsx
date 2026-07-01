'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useEditMode } from '@/components/edit/EditModeProvider';

interface UpdateItemVisibilityToggleProps {
  type: 'social' | 'news' | 'sighting';
  id: string;
  isVisible: boolean;
  onChange?: (isVisible: boolean) => void;
}

export function UpdateItemVisibilityToggle({
  type,
  id,
  isVisible,
  onChange,
}: UpdateItemVisibilityToggleProps) {
  const { adminToken } = useEditMode();
  const [visible, setVisible] = useState(isVisible);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading || !adminToken) return;
    const next = !visible;
    setLoading(true);

    try {
      const res = await fetch('/api/admin/updates/items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ type, id, isVisible: next }),
      });
      if (!res.ok) throw new Error('更新失败');
      setVisible(next);
      onChange?.(next);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs transition-colors',
        visible
          ? 'border-green-500/40 bg-green-500/10 text-green-300'
          : 'border-white/15 bg-white/5 text-text-muted',
        loading && 'cursor-wait opacity-60',
      )}
      title={visible ? '前台显示中，点击隐藏' : '前台已隐藏，点击显示'}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', visible ? 'bg-green-300' : 'bg-text-muted')}
      />
      {visible ? '显示' : '隐藏'}
    </button>
  );
}
