'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';

interface ActivitiesFilterBarProps {
  currentTab: string;
  currentPlatform?: string;
  counts?: { endorsement: number; livestream: number };
  className?: string;
}

const livestreamPlatformFilters = [
  { label: '全部', value: '' },
  { label: '微博', value: 'weibo' },
  { label: '抖音', value: 'douyin' },
  { label: 'Instagram', value: 'instagram' },
];

export function ActivitiesFilterBar({
  currentTab,
  currentPlatform,
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

  const handlePlatformChange = useCallback(
    (platform: string) => {
      router.push(buildUrl({ tab: 'livestream', platform }), { scroll: false });
    },
    [router, buildUrl],
  );

  const tabs = [
    {
      label: counts ? `代言 (${counts.endorsement})` : '代言',
      value: 'endorsement',
    },
    {
      label: counts ? `直播 (${counts.livestream})` : '直播',
      value: 'livestream',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />

      {/* Platform sub-filters — only for livestream tab */}
      {currentTab === 'livestream' && (
        <div className="flex flex-wrap gap-2">
          {livestreamPlatformFilters.map((filter) => (
            <Tag
              key={filter.value}
              active={currentPlatform === filter.value || (!currentPlatform && filter.value === '')}
              onClick={() => handlePlatformChange(filter.value)}
            >
              {filter.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
