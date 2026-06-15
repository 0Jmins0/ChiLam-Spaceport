import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';

export default function GalleryLoading() {
  return (
    <PageContainer>
      <PageHeader title="相册" titleEn="Gallery" description="图片 · 视频 · 音频 · 合集" />

      {/* Tab 骨架 */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded bg-bg-darker" />
          ))}
        </div>
      </div>

      {/* 卡片网格骨架 */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg bg-white/5">
            <div className="aspect-[4/3] animate-pulse bg-bg-darker" />
            <div className="p-2">
              <div className="h-3 w-2/3 animate-pulse rounded bg-bg-darker" />
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
