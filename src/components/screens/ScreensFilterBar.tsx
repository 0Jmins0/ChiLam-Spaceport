'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';

interface ScreensFilterBarProps {
  currentTab: string;
  currentRoleType?: string;
  counts?: { movie: number; tv_series: number; variety_show: number };
  className?: string;
}

const actingRoleFilters = [
  { label: '全部', value: '' },
  { label: '主演', value: '主演' },
  { label: '客串', value: '客串' },
];

const varietyRoleFilters = [
  { label: '全部', value: '' },
  { label: '常驻', value: '常驻' },
  { label: '飞行', value: '飞行' },
];

export function ScreensFilterBar({
  currentTab,
  currentRoleType,
  counts,
  className,
}: ScreensFilterBarProps) {
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
      return `/screens?${newParams.toString()}`;
    },
    [searchParams],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      // When changing tabs, clear all sub-filters
      const newParams = new URLSearchParams();
      newParams.set('tab', value);
      router.push(`/screens?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleRoleTypeChange = useCallback(
    (roleType: string) => {
      router.push(buildUrl({ tab: currentTab, roleType }), { scroll: false });
    },
    [router, buildUrl, currentTab],
  );

  const roleFilters = currentTab === 'variety_show' ? varietyRoleFilters : actingRoleFilters;

  const tabs = [
    {
      label: counts ? `电影 (${counts.movie})` : '电影',
      value: 'movie',
    },
    {
      label: counts ? `电视剧 (${counts.tv_series})` : '电视剧',
      value: 'tv_series',
    },
    {
      label: counts ? `综艺 (${counts.variety_show})` : '综艺',
      value: 'variety_show',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />

      {/* Role type sub-filters — different options per tab */}
      <div className="flex flex-wrap gap-2">
        {roleFilters.map((filter) => (
          <Tag
            key={filter.value}
            active={currentRoleType === filter.value || (!currentRoleType && filter.value === '')}
            onClick={() => handleRoleTypeChange(filter.value)}
          >
            {filter.label}
          </Tag>
        ))}
      </div>
    </div>
  );
}
