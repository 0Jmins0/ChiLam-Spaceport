import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  className?: string;
}

export function Pagination({ currentPage, totalPages, baseUrl, className }: PaginationProps) {
  const buildPageUrl = (page: number) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <div className={cn('flex items-center justify-center gap-4 pt-8', className)}>
      {currentPage > 1 && (
        <Link href={buildPageUrl(currentPage - 1)}>
          <Button variant="secondary" size="sm">
            上一页
          </Button>
        </Link>
      )}
      <span className="text-sm text-text-secondary">
        {currentPage} / {totalPages}
      </span>
      {currentPage < totalPages && (
        <Link href={buildPageUrl(currentPage + 1)}>
          <Button variant="secondary" size="sm">
            下一页
          </Button>
        </Link>
      )}
    </div>
  );
}
