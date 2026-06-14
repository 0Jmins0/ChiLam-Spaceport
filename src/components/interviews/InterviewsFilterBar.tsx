'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { cn } from '@/lib/cn';
import { Tag } from '@/components/ui/Tag';

interface InterviewsFilterBarProps {
  currentMediaType: string;
  totalCount: number;
  counts: Record<string, number>;
  className?: string;
}

const mediaTypeFilters = [
  { label: '全部', value: '' },
  { label: '视频', value: 'VIDEO' },
  { label: '音频', value: 'AUDIO' },
  { label: '图文', value: 'TEXT' },
];

export function InterviewsFilterBar({
  currentMediaType,
  totalCount,
  counts,
  className,
}: InterviewsFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMediaTypeChange = useCallback(
    (mediaType: string) => {
      const newParams = new URLSearchParams(searchParams.toString());
      // Always clear page when filters change
      newParams.delete('page');
      if (mediaType) {
        newParams.set('mediaType', mediaType);
      } else {
        newParams.delete('mediaType');
      }
      router.push(`/interviews?${newParams.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* Total count */}
      <p className="text-sm text-text-muted">
        共 <span className="text-text-primary">{totalCount}</span> 条访谈
      </p>

      {/* Media type filters */}
      <div className="flex flex-wrap gap-2">
        {mediaTypeFilters.map((filter) => {
          const count = filter.value ? counts[filter.value] || 0 : totalCount;
          return (
            <Tag
              key={filter.value}
              active={
                currentMediaType === filter.value || (!currentMediaType && filter.value === '')
              }
              onClick={() => handleMediaTypeChange(filter.value)}
            >
              {filter.label}
              {count > 0 && ` (${count})`}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
