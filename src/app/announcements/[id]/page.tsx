import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAnnouncementById } from '@/lib/queries/announcements';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tag } from '@/components/ui/Tag';
import type { AnnouncementTab } from '@/lib/types';

const typeLabels: Record<AnnouncementTab, string> = {
  notice: '网站公告',
  rule: '规则说明',
  update: '更新通知',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    return { title: '未找到' };
  }

  return {
    title: announcement.title,
    description: announcement.content.slice(0, 160),
  };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) notFound();

  const dateStr = new Date(announcement.publishDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageContainer>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href={`/announcements?type=${announcement.type}`}
          className="text-sm text-text-secondary hover:text-accent transition-colors"
        >
          &larr; 返回公告
        </Link>
      </div>

      {/* Content */}
      <article className="max-w-3xl">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <Tag active>{typeLabels[announcement.type]}</Tag>
          {announcement.isPinned && (
            <span className="text-xs font-medium text-accent">📌 置顶</span>
          )}
          <span className="text-xs text-text-muted">{dateStr}</span>
        </div>

        {/* Title */}
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-text-primary mb-6">
          {announcement.title}
        </h1>

        {/* Gold line */}
        <div className="gold-line mb-6" />

        {/* Body */}
        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed whitespace-pre-wrap">
          {announcement.content}
        </div>
      </article>
    </PageContainer>
  );
}
