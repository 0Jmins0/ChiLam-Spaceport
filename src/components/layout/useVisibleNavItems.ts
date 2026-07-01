'use client';

import { useEffect, useMemo, useState } from 'react';
import { NAV_ITEMS } from '@/config/navigation';
import { useEditMode } from '@/components/edit/EditModeProvider';

type UpdateCategoryState = {
  key: string;
  slug: string;
  isVisible: boolean;
};

export function useVisibleNavItems() {
  const { editMode } = useEditMode();
  const [updatesVisible, setUpdatesVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/updates/visibility')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (cancelled || !payload?.data) return;
        const root = (payload.data as UpdateCategoryState[]).find((item) => item.key === 'root');
        setUpdatesVisible(root?.isVisible ?? true);
      })
      .catch(() => {
        if (!cancelled) setUpdatesVisible(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    if (editMode || updatesVisible) return NAV_ITEMS;
    return NAV_ITEMS.filter((item) => item.href !== '/updates');
  }, [editMode, updatesVisible]);
}
