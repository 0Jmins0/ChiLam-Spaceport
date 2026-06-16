import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { GuestbookCardActions } from '@/components/guestbook/GuestbookCardActions';
import type { GuestbookItem } from '@/lib/types';

interface GuestbookCardProps {
  item: GuestbookItem;
  className?: string;
  currentUserId?: string;
}

export function GuestbookCard({ item, className, currentUserId }: GuestbookCardProps) {
  const truncatedContent =
    item.content.length > 150 ? item.content.slice(0, 150) + '...' : item.content;

  const timeStr = new Date(item.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const hasBackground = !!(item.thumbnail && item.imageAsBackground);
  const hasThumbnail = !!(item.thumbnail && !item.imageAsBackground);

  return (
    <Link href={`/messages/${item.id}`} className={cn('block', className)}>
      <Card
        className={cn(
          'flex flex-col gap-3 p-4 h-full',
          hasBackground && 'relative overflow-hidden',
          item.isFeatured &&
            'border-amber-500/40 bg-gradient-to-br from-amber-500/5 to-transparent',
        )}
      >
        {/* 精選标记 */}
        {item.isFeatured && (
          <span className="absolute top-2 right-2 z-20 flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/30">
            ⭐ 精選
          </span>
        )}

        {/* 融合模式背景图 */}
        {hasBackground && (
          <div
            className="absolute inset-y-0 right-0 w-[45%] pointer-events-none"
            style={{
              backgroundImage: `url(${item.thumbnail})`,
              backgroundSize: 'cover',
              backgroundPosition: item.imageCropData
                ? `${item.imageCropData.x * 100 + item.imageCropData.width * 50}% ${item.imageCropData.y * 100 + item.imageCropData.height * 50}%`
                : 'center',
              maskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.8) 70%, black 100%)',
              WebkitMaskImage:
                'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 30%, rgba(0,0,0,0.8) 70%, black 100%)',
            }}
          />
        )}

        {/* 头部 + 内容 + 故事标签（有背景图时限制宽度） */}
        <div className={cn(hasBackground && 'w-[55%] relative z-10', 'flex flex-col gap-3')}>
          {/* 头部：昵称 + 时间 */}
          <div className="flex flex-col items-start gap-0.5">
            <span className="font-heading text-sm text-accent">{item.nickname}</span>
            <span className="text-[11px] text-text-muted/70">{timeStr}</span>
          </div>

          {/* 内容（可能带缩略图） */}
          <div className={cn('flex-1', hasThumbnail && 'flex gap-3')}>
            <p className="text-sm leading-relaxed text-text-secondary">{truncatedContent}</p>
            {hasThumbnail && (
              <div className="flex-shrink-0 ml-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.thumbnail!} alt="" className="h-16 w-16 rounded object-cover" />
              </div>
            )}
          </div>

          {/* 故事 tab 额外信息 */}
          {item.tab === 'story' && (
            <div className="flex flex-wrap gap-1.5">
              {item.relatedYear && <Tag active>{item.relatedYear}</Tag>}
              {item.storyTags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* 底部：点赞 + 评论 + 操作按钮 */}
        <div
          className={cn(
            'flex items-center gap-4 pt-2 border-t border-border-gold/30',
            hasBackground && 'relative z-10',
          )}
        >
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <HeartIcon />
            {item.likesCount}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-muted">
            <CommentIcon />
            {item.commentsCount}
          </span>
          {currentUserId && item.userId === currentUserId && (
            <span onClick={(e) => e.preventDefault()}>
              <GuestbookCardActions
                messageId={item.id}
                message={{
                  id: item.id,
                  content: item.content,
                  tab: item.tab,
                  storyTags: item.storyTags,
                  relatedYear: item.relatedYear,
                }}
              />
            </span>
          )}
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
