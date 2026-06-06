import { cn } from '@/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 p-4 transition-all duration-200',
        hover && 'hover:border-accent/60 hover:bg-bg-dark/80',
        className,
      )}
    >
      {children}
    </div>
  );
}
