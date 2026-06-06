'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import type { AnnouncementTab } from '@/lib/types';

interface AnnouncementsFilterBarProps {
  currentTab: string;
  counts?: Record<AnnouncementTab, number>;
  className?: string;
}

export function AnnouncementsFilterBar({
  currentTab,
  counts,
  className,
}: AnnouncementsFilterBarProps) {
  const router = useRouter();

  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams();
      if (value) newParams.set('type', value);
      router.push(`/announcements?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  const tabs = [
    {
      label: counts ? `网站公告 (${counts.notice})` : '网站公告',
      value: 'notice',
    },
    {
      label: counts ? `规则说明 (${counts.rule})` : '规则说明',
      value: 'rule',
    },
    {
      label: counts ? `更新通知 (${counts.update})` : '更新通知',
      value: 'update',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
}
