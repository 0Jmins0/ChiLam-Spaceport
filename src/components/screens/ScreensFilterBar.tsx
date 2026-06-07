'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';

interface ScreensFilterBarProps {
  currentTab: string;
  currentDecade?: string;
  counts?: { movie: number; tv_series: number; variety_show: number };
  className?: string;
}

const decadeFilters = [
  { label: '全部', value: '' },
  { label: '90年代', value: '1990' },
  { label: '00年代', value: '2000' },
  { label: '10年代', value: '2010' },
  { label: '20年代', value: '2020' },
];

export function ScreensFilterBar({
  currentTab,
  currentDecade,
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

  const handleDecadeChange = useCallback(
    (decade: string) => {
      router.push(buildUrl({ tab: currentTab, decade }), { scroll: false });
    },
    [router, buildUrl, currentTab],
  );

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

      {/* Decade sub-filters — shown for all tabs */}
      <div className="flex flex-wrap gap-2">
        {decadeFilters.map((filter) => (
          <Tag
            key={filter.value}
            active={currentDecade === filter.value || (!currentDecade && filter.value === '')}
            onClick={() => handleDecadeChange(filter.value)}
          >
            {filter.label}
          </Tag>
        ))}
      </div>
    </div>
  );
}
