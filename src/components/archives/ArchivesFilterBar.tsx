'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { TabBar } from '@/components/ui/TabBar';
import { Tag } from '@/components/ui/Tag';

interface ArchivesFilterBarProps {
  currentTab: string;
  currentLanguage?: string;
  counts?: { album: number; magazine: number };
  className?: string;
}

const languageFilters = [
  { label: '全部', value: '' },
  { label: '粤语', value: '粤语' },
  { label: '国语', value: '国语' },
];

export function ArchivesFilterBar({
  currentTab,
  currentLanguage,
  counts,
  className,
}: ArchivesFilterBarProps) {
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
      return `/archives?${newParams.toString()}`;
    },
    [searchParams],
  );

  const handleTabChange = useCallback(
    (value: string) => {
      // When changing tabs, clear all sub-filters
      const newParams = new URLSearchParams();
      newParams.set('tab', value);
      router.push(`/archives?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  const handleLanguageChange = useCallback(
    (language: string) => {
      router.push(buildUrl({ tab: 'album', language }), { scroll: false });
    },
    [router, buildUrl],
  );

  const tabs = [
    {
      label: counts ? `专辑 (${counts.album})` : '专辑',
      value: 'album',
    },
    {
      label: counts ? `杂志 (${counts.magazine})` : '杂志',
      value: 'magazine',
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <TabBar tabs={tabs} activeTab={currentTab} onTabChange={handleTabChange} />

      {/* Language sub-filters — only for album tab */}
      {currentTab === 'album' && (
        <div className="flex flex-wrap gap-2">
          {languageFilters.map((filter) => (
            <Tag
              key={filter.value}
              active={currentLanguage === filter.value || (!currentLanguage && filter.value === '')}
              onClick={() => handleLanguageChange(filter.value)}
            >
              {filter.label}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}
