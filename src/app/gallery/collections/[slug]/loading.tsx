import { PageContainer } from '@/components/layout/PageContainer';

export default function CollectionLoading() {
  return (
    <PageContainer>
      {/* 返回链接骨架 */}
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-bg-darker" />

      {/* 标题骨架 */}
      <div className="mb-8">
        <div className="h-8 w-48 animate-pulse rounded bg-bg-darker" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-bg-darker/50" />
        <div className="mt-1 h-3 w-32 animate-pulse rounded bg-bg-darker/50" />
      </div>

      {/* 卡片网格骨架 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-white/5">
            <div className="aspect-[4/3] animate-pulse bg-bg-darker" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
