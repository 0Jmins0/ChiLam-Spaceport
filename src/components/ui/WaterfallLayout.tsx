import { cn } from '@/lib/cn';

interface WaterfallLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function WaterfallLayout({ children, className }: WaterfallLayoutProps) {
  return (
    <div
      className={cn(
        'columns-2 gap-4 md:columns-3 lg:columns-4',
        '[&>*]:mb-4 [&>*]:break-inside-avoid',
        className,
      )}
    >
      {children}
    </div>
  );
}
