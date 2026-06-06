import { cn } from '@/lib/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-body tracking-wide transition-all duration-150',
        'rounded-[var(--radius-button)]',
        // Size
        size === 'sm' && 'px-4 py-1.5 text-xs',
        size === 'md' && 'px-6 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-3 text-base',
        // Variant
        variant === 'primary' && 'bg-accent text-bg-dark hover:bg-accent-hover active:scale-[0.98]',
        variant === 'secondary' &&
          'border border-accent text-accent hover:bg-accent/10 active:scale-[0.98]',
        variant === 'ghost' && 'text-text-secondary hover:text-accent hover:bg-accent/5',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
