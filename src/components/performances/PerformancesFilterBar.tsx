'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';

interface PerformancesFilterBarProps {
  currentTab: string;
  currentSeries?: string;
  counts?: { concert: number; stage: number; musical: number };
  className?: string;
}

const seriesFilters = [
  { label: '全部', value: '' },
  { label: '我是外星人', value: '我是外星人' },
  { label: 'Crazy Hours', value: 'Crazy Hours' },
  { label: 'Miniconcert', value: 'Miniconcert' },
  { label: '在', value: '在' },
];

export function PerformancesFilterBar({
  currentTab,
  currentSeries,
  counts,
  className,
}: PerformancesFilterBarProps) {
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
      return `/performances?${newParams.toString()}`;
    },
    [searchParams],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      // When changing tabs, clear all sub-filters
      const newParams = new URLSearchParams();
      newParams.set('tab', value);
      router.push(`/performances?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleSeriesChange = useCallback(
    (series: string) => {
      router.push(buildUrl({ tab: 'concert', series }), { scroll: false });
    },
    [router, buildUrl],
  );

  const tabs = [
    {
      label: counts ? `演唱会 (${counts.concert})` : '演唱会',
      value: 'concert',
    },
    {
      label: counts ? `舞台 (${counts.stage})` : '舞台',
      value: 'stage',
    },
    {
      label: counts ? `音乐剧 (${counts.musical})` : '音乐剧',
      value: 'musical',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />

      {/* Series sub-filters — only for concert tab */}
      {currentTab === 'concert' && (
        <div className="flex flex-wrap gap-2">
          {seriesFilters.map((filter) => (
            <Tag
              key={filter.value || 'all'}
              active={currentSeries === filter.value || (!currentSeries && filter.value === '')}
              onClick={() => handleSeriesChange(filter.value)}
            >
              {filter.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
