export function GuestbookCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-border-gold/30 bg-bg-dark/50 p-4 animate-pulse space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 rounded bg-bg-darker" />
        <div className="h-3 w-20 rounded bg-bg-darker" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-bg-darker" />
        <div className="h-3 w-4/5 rounded bg-bg-darker" />
        <div className="h-3 w-3/5 rounded bg-bg-darker" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-2 border-t border-border-gold/20">
        <div className="h-3 w-10 rounded bg-bg-darker" />
        <div className="h-3 w-10 rounded bg-bg-darker" />
      </div>
    </div>
  );
}
