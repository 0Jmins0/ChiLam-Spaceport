import { cn } from '@/lib/cn';

interface GoldDividerProps {
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export function GoldDivider({ direction = 'horizontal', className }: GoldDividerProps) {
  return (
    <div
      className={cn(
        direction === 'horizontal' ? 'gold-line w-full' : 'gold-line-vertical h-full',
        className,
      )}
    />
  );
}
