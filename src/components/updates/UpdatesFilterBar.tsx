'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';
import { useEditMode } from '@/components/edit/EditModeProvider';

interface UpdatesFilterBarProps {
  currentTab: string;
  currentPlatform?: string;
  currentSightingType?: string;
  counts?: { social: number; news: number; sighting: number };
  categoryStates?: { key: string; label: string; isVisible: boolean }[];
  platformFilters?: { label: string; value: string; count: number }[];
  sightingTypeFilters?: { label: string; value: string; count: number }[];
  allPlatformFilters?: { label: string; value: string; count: number }[];
  allSightingTypeFilters?: { label: string; value: string; count: number }[];
  className?: string;
}

export function UpdatesFilterBar({
  currentTab,
  currentPlatform,
  currentSightingType,
  counts,
  categoryStates,
  platformFilters = [],
  sightingTypeFilters = [],
  allPlatformFilters,
  allSightingTypeFilters,
  className,
}: UpdatesFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { editMode } = useEditMode();

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

  const tabStates = new Map(categoryStates?.map((category) => [category.key, category]));
  const tabs = [
    {
      label: counts ? `社交媒体 (${counts.social})` : '社交媒体',
      value: 'social',
      visible: tabStates.get('social')?.isVisible ?? true,
    },
    {
      label: counts ? `新闻报道 (${counts.news})` : '新闻报道',
      value: 'news',
      visible: tabStates.get('news')?.isVisible ?? true,
    },
    {
      label: counts ? `路透 (${counts.sighting})` : '路透',
      value: 'sighting',
      visible: tabStates.get('sighting')?.isVisible ?? true,
    },
  ].filter((tab) => editMode || tab.visible);

  const visiblePlatformFilters = [
    { label: '全部', value: '', count: counts?.social ?? 0 },
    ...(editMode ? (allPlatformFilters ?? platformFilters) : platformFilters),
  ].filter((filter) => editMode || filter.value === '' || filter.count > 0);

  const visibleSightingTypeFilters = [
    { label: '全部', value: '', count: counts?.sighting ?? 0 },
    ...(editMode ? (allSightingTypeFilters ?? sightingTypeFilters) : sightingTypeFilters),
  ].filter((filter) => editMode || filter.value === '' || filter.count > 0);

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />

      {/* Platform sub-filters for social tab */}
      {currentTab === 'social' && (
        <div className="flex flex-wrap gap-2">
          {visiblePlatformFilters.map((filter) => (
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
          {visibleSightingTypeFilters.map((filter) => (
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
