import { cn } from '@/lib/cn';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={cn('mx-auto max-w-[var(--width-page)] px-6 pt-24 pb-16', className)}>
      {children}
    </main>
  );
}
