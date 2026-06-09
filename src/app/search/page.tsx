import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { SearchResultCard } from '@/components/layout/SearchResultCard';
import { searchFull } from '@/lib/queries/search';
import { cn } from '@/lib/cn';
import type { SearchResultType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const metadata = { title: '搜索' };

const TYPE_TABS = [
  { label: '全部', value: 'all' },
  { label: '社交动态', value: 'social_post' },
  { label: '新闻报道', value: 'news' },
  { label: '路透', value: 'sighting' },
  { label: '影视综', value: 'production' },
  { label: '演出', value: 'performance' },
  { label: '代言', value: 'endorsement' },
  { label: '访谈', value: 'interview' },
  { label: '直播', value: 'livestream' },
  { label: '专辑', value: 'album' },
  { label: '杂志', value: 'magazine' },
];

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams.q?.trim() || '';
  const type = searchParams.type || 'all';
  const page = parseInt(searchParams.page || '1', 10);

  // Empty state
  if (!q || q.length < 2) {
    return (
      <PageContainer>
        <PageHeader title="搜索" titleEn="Search" />
        <p className="py-16 text-center text-sm text-text-secondary">请输入关键词进行搜索</p>
      </PageContainer>
    );
  }

  const result = await searchFull({ q, type: type as SearchResultType | 'all', page });

  const { totalPages } = result;

  return (
    <PageContainer>
      <PageHeader
        title="搜索结果"
        titleEn="Search"
        description={`找到 ${result.totalCount} 条与 "${q}" 相关的内容`}
      />

      {/* Type filter tabs */}
      <div className="mb-8 -mx-6 overflow-x-auto px-6">
        <div className="flex gap-2">
          {TYPE_TABS.map((tab) => {
            const isActive = tab.value === type;
            const params = new URLSearchParams();
            params.set('q', q);
            if (tab.value !== 'all') params.set('type', tab.value);

            return (
              <Link
                key={tab.value}
                href={`/search?${params.toString()}`}
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs tracking-wide transition-all duration-150',
                  isActive
                    ? 'border-accent bg-accent/20 text-accent'
                    : 'border-border-gold text-text-secondary hover:border-accent/60 hover:text-accent',
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {result.items.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-muted">
          未找到与 &ldquo;{q}&rdquo; 相关的内容
        </p>
      ) : (
        <div className="space-y-4">
          {result.items.map((item) => (
            <SearchResultCard
              key={`${item.type}-${item.id}`}
              type={item.type}
              typeLabel={item.typeLabel}
              title={item.title}
              snippet={item.snippet}
              url={item.url}
              date={item.date}
              query={q}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            params.set('q', q);
            if (type !== 'all') params.set('type', type);
            params.set('page', String(p));

            return (
              <Link
                key={p}
                href={`/search?${params.toString()}`}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded text-sm transition-colors',
                  p === page ? 'bg-accent text-bg-dark' : 'text-text-secondary hover:text-accent',
                )}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
