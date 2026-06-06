'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import type { MessageTab } from '@/lib/types';

interface GuestbookFilterBarProps {
  currentTab: string;
  counts?: Record<MessageTab, number>;
  className?: string;
}

export function GuestbookFilterBar({ currentTab, counts, className }: GuestbookFilterBarProps) {
  const router = useRouter();

  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams();
      newParams.set('tab', value);
      router.push(`/messages?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  const tabs = [
    {
      label: counts ? `我想对你说 (${counts.message})` : '我想对你说',
      value: 'message',
    },
    {
      label: counts ? `故事分享 (${counts.story})` : '故事分享',
      value: 'story',
    },
    {
      label: counts ? `建议反馈 (${counts.feedback})` : '建议反馈',
      value: 'feedback',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
}
