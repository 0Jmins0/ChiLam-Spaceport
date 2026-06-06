import { cn } from '@/lib/cn';

interface TagProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function Tag({ children, active, onClick, className }: TagProps) {
  const Component = onClick ? 'button' : 'span';
  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide transition-all duration-150',
        active
          ? 'border-accent bg-accent/20 text-accent'
          : 'border-border-gold text-text-secondary hover:border-accent/60 hover:text-accent',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </Component>
  );
}
