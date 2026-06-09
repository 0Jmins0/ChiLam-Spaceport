import { PageContainer } from '@/components/layout/PageContainer';

export default function SearchLoading() {
  return (
    <PageContainer>
      <div className="animate-pulse space-y-6">
        <div className="h-10 w-48 rounded bg-border-gold/20" />
        <div className="h-6 w-96 rounded bg-border-gold/20" />
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-[var(--radius-card)] border border-border-gold/20 bg-bg-dark/50"
            />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
