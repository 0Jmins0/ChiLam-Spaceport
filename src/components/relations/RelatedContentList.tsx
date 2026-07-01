import Link from 'next/link';
import { CONTENT_TYPE_LABELS, type RelatedContentSummary } from '@/lib/content-types';

interface RelatedContentListProps {
  items: RelatedContentSummary[];
  title?: string;
}

export function RelatedContentList({ items, title = '相关内容' }: RelatedContentListProps) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8 border-t border-border-gold pt-6">
      <h2 className="mb-3 text-sm font-medium tracking-wide text-text-primary">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.id}`}
            href={item.url}
            className="block border border-border-gold/40 bg-bg-dark/40 p-3 transition-colors hover:border-accent/60"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-text-primary">{item.title}</p>
                {item.subtitle && <p className="mt-0.5 text-xs text-text-muted">{item.subtitle}</p>}
              </div>
              <span className="shrink-0 text-xs text-accent">
                {CONTENT_TYPE_LABELS[item.type] ?? item.type}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
