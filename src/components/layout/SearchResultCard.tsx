import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface SearchResultCardProps {
  type: string;
  typeLabel: string;
  title: string;
  snippet: string | null;
  url: string;
  date: string | null;
  query: string;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-accent/30 text-accent">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function SearchResultCard({
  typeLabel,
  title,
  snippet,
  url,
  date,
  query,
}: SearchResultCardProps) {
  return (
    <Link href={url} className="block">
      <Card className="group">
        {/* Row 1: type tag + date */}
        <div className="mb-2 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs text-accent">
            {typeLabel}
          </span>
          {date && <span className="text-xs text-text-muted">{date}</span>}
        </div>

        {/* Row 2: title */}
        <h3 className="font-heading text-base text-text-primary transition-colors group-hover:text-accent">
          {highlightText(title, query)}
        </h3>

        {/* Row 3: snippet */}
        {snippet && (
          <p className="mt-1.5 line-clamp-2 text-sm text-text-secondary">
            {highlightText(snippet, query)}
          </p>
        )}
      </Card>
    </Link>
  );
}
