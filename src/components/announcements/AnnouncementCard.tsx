import Link from 'next/link';

import { cn } from '@/lib/cn';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import type { AnnouncementTab } from '@/lib/types';

interface AnnouncementCardProps {
  id: string;
  type: AnnouncementTab;
  title: string;
  content: string;
  isPinned: boolean;
  publishDate: string;
  className?: string;
}

const typeLabels: Record<AnnouncementTab, string> = {
  notice: '公告',
  rule: '规则',
  update: '更新',
};

export function AnnouncementCard({
  id,
  type,
  title,
  content,
  isPinned,
  publishDate,
  className,
}: AnnouncementCardProps) {
  // 截断内容到 200 字
  const truncated = content.length > 200 ? content.slice(0, 200) + '...' : content;
  const dateStr = new Date(publishDate).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/announcements/${id}`} className={cn('block', className)}>
      <Card className="p-4 space-y-3">
        {/* Header: badge + date */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Tag active>{typeLabels[type]}</Tag>
            {isPinned && <span className="text-xs font-medium text-accent">置顶</span>}
          </div>
          <span className="text-xs text-text-muted">{dateStr}</span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-base leading-snug text-text-primary line-clamp-2">
          {isPinned && <span className="mr-1">📌</span>}
          {title}
        </h3>

        {/* Content preview */}
        <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">{truncated}</p>
      </Card>
    </Link>
  );
}
