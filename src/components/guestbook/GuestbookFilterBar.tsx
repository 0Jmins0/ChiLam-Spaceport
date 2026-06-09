'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';
import type { MessageTab } from '@/lib/types';

interface GuestbookFilterBarProps {
  currentTab: string;
  currentStoryTag?: string;
  counts?: Record<MessageTab, number>;
  className?: string;
}

const storyTagFilters = [
  { label: '全部', value: '' },
  { label: '追星经历', value: '追星经历' },
  { label: '影视回忆', value: '影视回忆' },
  { label: '音乐记忆', value: '音乐记忆' },
  { label: '冷知识', value: '冷知识' },
  { label: '其他', value: '其他' },
];

export function GuestbookFilterBar({
  currentTab,
  currentStoryTag,
  counts,
  className,
}: GuestbookFilterBarProps) {
  const router = useRouter();

  const handleTabChange = useCallback(
    (value: string) => {
      const newParams = new URLSearchParams();
      newParams.set('tab', value);
      router.push(`/messages?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleStoryTagChange = useCallback(
    (storyTag: string) => {
      const newParams = new URLSearchParams();
      newParams.set('tab', 'story');
      if (storyTag) {
        newParams.set('storyTag', storyTag);
      }
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

      {/* Story tag sub-filters — only for story tab */}
      {currentTab === 'story' && (
        <div className="flex flex-wrap gap-2">
          {storyTagFilters.map((filter) => (
            <Tag
              key={filter.value}
              active={currentStoryTag === filter.value || (!currentStoryTag && filter.value === '')}
              onClick={() => handleStoryTagChange(filter.value)}
            >
              {filter.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
