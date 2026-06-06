'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';

interface ActivitiesFilterBarProps {
  currentTab: string;
  currentMediaType?: string;
  counts?: { endorsement: number; interview: number };
  className?: string;
}

const mediaTypeFilters = [
  { label: '全部', value: '' },
  { label: '视频', value: 'VIDEO' },
  { label: '音频', value: 'AUDIO' },
  { label: '图文', value: 'TEXT' },
  { label: '直播', value: 'LIVE' },
];

export function ActivitiesFilterBar({
  currentTab,
  currentMediaType,
  counts,
  className,
}: ActivitiesFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      // Always clear page when filters change
      newParams.delete('page');
      for (const [key, value] of Object.entries(params)) {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      }
      return `/activities?${newParams.toString()}`;
    },
    [searchParams],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      // When changing tabs, clear all sub-filters
      const newParams = new URLSearchParams();
      newParams.set('tab', value);
      router.push(`/activities?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleMediaTypeChange = useCallback(
    (mediaType: string) => {
      router.push(buildUrl({ tab: 'interview', mediaType }), { scroll: false });
    },
    [router, buildUrl],
  );

  const tabs = [
    {
      label: counts ? `代言 (${counts.endorsement})` : '代言',
      value: 'endorsement',
    },
    {
      label: counts ? `访谈 (${counts.interview})` : '访谈',
      value: 'interview',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />

      {/* Media type sub-filters — only for interview tab */}
      {currentTab === 'interview' && (
        <div className="flex flex-wrap gap-2">
          {mediaTypeFilters.map((filter) => (
            <Tag
              key={filter.value}
              active={
                currentMediaType === filter.value || (!currentMediaType && filter.value === '')
              }
              onClick={() => handleMediaTypeChange(filter.value)}
            >
              {filter.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
