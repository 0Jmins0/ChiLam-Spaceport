import { cn } from '@/lib/cn';

interface MasonryLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MasonryLayout({ children, className }: MasonryLayoutProps) {
  return (
    <div className={cn('columns-2 gap-4 md:columns-3 lg:columns-4', className)}>{children}</div>
  );
}
