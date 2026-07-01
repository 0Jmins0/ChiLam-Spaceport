'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import type { GalleryItem } from '@/lib/types';

// 构建来源链接
function getSourceUrl(source: GalleryItem['source']): string | null {
  if (!source) return null;
  switch (source.type) {
    case 'production':
      return `/screens/${source.slug}`;
    case 'performance':
      return `/performances/${source.slug}`;
    case 'album':
      return `/archives/albums/${source.slug}`;
    case 'magazine':
      return `/archives/magazines/${source.slug}`;
    case 'endorsement':
      return `/activities/endorsements/${source.slug}`;
    case 'interview':
      return `/interviews/${source.slug}`;
    default:
      return null;
  }
}

interface LightboxViewerProps {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LightboxViewer({ items, currentIndex, onClose, onNavigate }: LightboxViewerProps) {
  const current = items[currentIndex];

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(currentIndex + 1);
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!current) return null;

  const sourceUrl = getSourceUrl(current.source);

  const content = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* 左箭头 */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white/70 hover:bg-black/60 hover:text-white"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* 媒体内容 */}
      <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        {current.type === 'VIDEO' || current.category === 'VIDEO' ? (
          <video
            key={current.id}
            src={current.url}
            poster={current.thumbnailUrl ?? undefined}
            controls
            playsInline
            preload="auto"
            className="max-h-[85vh] max-w-[90vw] rounded"
          />
        ) : current.type === 'AUDIO' || current.category === 'AUDIO' ? (
          <div className="flex flex-col items-center gap-6 px-8 py-12">
            <svg
              className="h-20 w-20 text-amber-500/80"
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
            {current.filename && (
              <p className="max-w-sm truncate text-sm text-white/70">{current.filename}</p>
            )}
            <audio key={current.id} src={current.url} controls autoPlay className="w-80" />
          </div>
        ) : (
          <Image
            src={current.url}
            alt={current.alt || current.caption || ''}
            width={current.width || 1200}
            height={current.height || 800}
            className="max-h-[85vh] w-auto object-contain"
            priority
          />
        )}
      </div>

      {/* 右箭头 */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white/70 hover:bg-black/60 hover:text-white"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* 底部信息 */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-2xl text-center">
          {current.caption && <p className="mb-2 text-sm text-white/80">{current.caption}</p>}
          {current.source && sourceUrl && (
            <Link
              href={sourceUrl}
              className="text-xs text-amber-500 hover:text-amber-400 hover:underline"
              onClick={onClose}
            >
              来自「{current.source.title}」→
            </Link>
          )}
          <p className="mt-1 text-xs text-white/40">
            {currentIndex + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  return createPortal(content, document.body);
}
