import { cn } from '@/lib/cn';

interface MasonryLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MasonryLayout({ children, className }: MasonryLayoutProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4', className)}>{children}</div>
  );
}
