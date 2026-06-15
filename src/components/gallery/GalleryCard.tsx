'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { useEditMode } from '@/components/edit/EditModeProvider';
import type { GalleryItem } from '@/lib/types';

interface GalleryCardProps {
  item: GalleryItem;
  onClick?: () => void;
  onDelete?: () => void;
  priority?: boolean;
}

export function GalleryCard({
  item,
  onClick,
  onDelete,
  priority = false,
}: GalleryCardProps) {
  const { editMode } = useEditMode();
  const [deleting, setDeleting] = useState(false);
  const isVideo = item.category === 'VIDEO' || item.type === 'VIDEO';
  const isAudio = item.category === 'AUDIO' || item.type === 'AUDIO';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(
        '确定删除此媒体文件？此操作不可撤销，R2 文件和所有关联引用都将被清除。',
      )
    )
      return;
    setDeleting(true);
    onDelete?.();
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-lg bg-white/5 text-left transition-all hover:bg-white/10',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50',
        deleting && 'pointer-events-none opacity-50',
      )}
    >
      {/* 编辑模式：删除按钮 */}
      {editMode && onDelete && (
        <div
          onClick={handleDelete}
          className="absolute left-1 top-1 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-600/80 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}

      {/* 图片/视频缩略图 */}
      {!isAudio ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={item.thumbnailUrl || item.url}
            alt={item.alt || item.caption || '媒体文件'}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={priority}
          />
          {/* 视频播放图标叠层 */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                <svg
                  className="ml-1 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 音频卡片样式 */
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-amber-900/20 to-amber-700/10">
          <div className="flex flex-col items-center gap-2 text-amber-500/60">
            <svg
              className="h-10 w-10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <span className="text-xs">{item.filename || '音频文件'}</span>
          </div>
        </div>
      )}

      {/* 底部信息 */}
      {item.caption && (
        <div className="p-2">
          <p className="line-clamp-2 text-xs text-white/60">{item.caption}</p>
        </div>
      )}
    </button>
  );
}
