'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';

interface UpdatesFilterBarProps {
  currentTab: string;
  currentPlatform?: string;
  currentSightingType?: string;
  counts?: { social: number; news: number; sighting: number };
  className?: string;
}

const platformFilters = [
  { label: '全部', value: '' },
  { label: '微博', value: 'weibo' },
  { label: '小红书', value: 'xiaohongshu' },
  { label: '抖音', value: 'douyin' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
];

const sightingTypeFilters = [
  { label: '全部', value: '' },
  { label: '机场', value: 'airport' },
  { label: '片场', value: 'set' },
  { label: '偶遇', value: 'encounter' },
];

export function UpdatesFilterBar({
  currentTab,
  currentPlatform,
  currentSightingType,
  counts,
  className,
}: UpdatesFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(params)) {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      }
      return `/updates?${newParams.toString()}`;
    },
    [searchParams],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      // When changing tabs, clear sub-filters
      const newParams = new URLSearchParams();
      newParams.set('tab', value);
      router.push(`/updates?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  const handlePlatformChange = useCallback(
    (platform: string) => {
      router.push(buildUrl({ tab: 'social', platform }), { scroll: false });
    },
    [router, buildUrl],
  );

  const handleSightingTypeChange = useCallback(
    (type: string) => {
      router.push(buildUrl({ tab: 'sighting', sightingType: type }), { scroll: false });
    },
    [router, buildUrl],
  );

  const tabs = [
    {
      label: counts ? `社交媒体 (${counts.social})` : '社交媒体',
      value: 'social',
    },
    {
      label: counts ? `新闻报道 (${counts.news})` : '新闻报道',
      value: 'news',
    },
    {
      label: counts ? `路透 (${counts.sighting})` : '路透',
      value: 'sighting',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />

      {/* Platform sub-filters for social tab */}
      {currentTab === 'social' && (
        <div className="flex flex-wrap gap-2">
          {platformFilters.map((filter) => (
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

      {/* Sighting type sub-filters for sighting tab */}
      {currentTab === 'sighting' && (
        <div className="flex flex-wrap gap-2">
          {sightingTypeFilters.map((filter) => (
            <Tag
              key={filter.value}
              active={
                currentSightingType === filter.value ||
                (!currentSightingType && filter.value === '')
              }
              onClick={() => handleSightingTypeChange(filter.value)}
            >
              {filter.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
