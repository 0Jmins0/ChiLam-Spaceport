import { cn } from '@/lib/cn';

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

export function MasonryGrid({ children, className }: MasonryGridProps) {
  return (
    <div className={cn('columns-2 gap-4 md:columns-3 lg:columns-4', className)}>{children}</div>
  );
}
