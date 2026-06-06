import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import type { GuestbookItem } from '@/lib/types';

interface GuestbookCardProps {
  item: GuestbookItem;
  className?: string;
}

export function GuestbookCard({ item, className }: GuestbookCardProps) {
  const truncatedContent =
    item.content.length > 150 ? item.content.slice(0, 150) + '...' : item.content;

  const timeStr = new Date(item.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/messages/${item.id}`} className={cn('block', className)}>
      <Card className="flex flex-col gap-3 p-4 h-full">
        {/* 头部：昵称 + 时间 */}
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm text-accent">{item.nickname}</span>
          <span className="text-xs text-text-muted">{timeStr}</span>
        </div>

        {/* 内容 */}
        <p className="flex-1 text-sm leading-relaxed text-text-secondary">{truncatedContent}</p>

        {/* 故事 tab 额外信息 */}
        {item.tab === 'story' && (
          <div className="flex flex-wrap gap-1.5">
            {item.relatedYear && <Tag active>{item.relatedYear}</Tag>}
            {item.storyTags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {/* 底部：点赞 + 评论 */}
        <div className="flex items-center gap-4 pt-2 border-t border-border-gold/30">
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <HeartIcon />
            {item.likesCount}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <CommentIcon />
            {item.commentsCount}
          </span>
        </div>
      </Card>
    </Link>
  );
}

function HeartIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}
