import { notFound } from 'next/navigation';
import Link from 'next/link';

import { PageContainer } from '@/components/layout/PageContainer';
import { LikeButton } from '@/components/guestbook/LikeButton';
import { FavoriteButton } from '@/components/guestbook/FavoriteButton';
import { CommentSection } from '@/components/guestbook/CommentSection';
import { Tag } from '@/components/ui/Tag';
import { getGuestbookById, getCommentsByTarget } from '@/lib/queries/guestbook';

export const dynamic = 'force-dynamic';

const tabLabels: Record<string, string> = {
  message: '我想对你说',
  story: '故事分享',
  feedback: '建议反馈',
};

export default async function GuestbookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [item, commentsData] = await Promise.all([
    getGuestbookById(id),
    getCommentsByTarget('guestbook', id),
  ]);

  if (!item) notFound();

  const timeStr = new Date(item.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/messages"
          className="inline-block text-sm text-accent hover:text-accent/80 transition-colors"
        >
          ← 返回留言板
        </Link>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Tag active>{tabLabels[item.tab] || item.tab}</Tag>
            <span className="text-sm text-text-muted">{timeStr}</span>
          </div>
          <h1 className="font-heading text-xl text-text-primary">{item.nickname}</h1>
        </div>

        {/* 内容 */}
        <div className="rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 p-5">
          <p className="text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">
            {item.content}
          </p>

          {/* 图片 */}
          {item.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {item.images.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={img.alt || '留言图片'}
                  className="rounded-md w-full object-cover"
                />
              ))}
            </div>
          )}

          {/* 故事标签 */}
          {item.tab === 'story' && (item.storyTags.length > 0 || item.relatedYear) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-border-gold/30">
              {item.relatedYear && <Tag active>{item.relatedYear}</Tag>}
              {item.storyTags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-3">
          <LikeButton id={item.id} initialCount={item.likesCount} />
          <FavoriteButton id={item.id} />
        </div>

        {/* 评论区 */}
        <div className="rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 p-5">
          <CommentSection
            targetId={item.id}
            initialComments={commentsData.items}
            totalCount={commentsData.totalCount}
          />
        </div>
      </div>
    </PageContainer>
  );
}
