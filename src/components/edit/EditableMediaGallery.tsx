'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { useEditMode } from './EditModeProvider';
import { LightboxViewer } from '@/components/gallery/LightboxViewer';
import type { GalleryItem } from '@/lib/types';

interface MediaItem {
  id: string;
  url: string;
  type: string; // 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE'
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

interface EditableMediaGalleryProps {
  media: MediaItem[];
  entityType: string;
  entityId: string;
  relation: string;
  className?: string;
  onRemove?: (mediaId: string) => Promise<void>;
}

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export function EditableMediaGallery({
  media,
  entityType,
  entityId,
  relation,
  className,
  onRemove,
}: EditableMediaGalleryProps) {
  const { editMode } = useEditMode();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [playingSet, setPlayingSet] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 非编辑模式下，无媒体则不渲染
  if (!editMode && media.length === 0) return null;

  const handleUploadClick = () => {
    if (uploadStatus === 'uploading') return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploadStatus('uploading');
    setErrorMsg('');

    try {
      // Step 1: 获取预签名 URL
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => null);
        throw new Error(errData?.error || '获取上传链接失败');
      }

      const { uploadUrl, publicUrl, key } = await presignRes.json();

      // Step 2: 直传 R2
      console.log('[Upload] Step 2: PUT to R2', {
        uploadUrl: uploadUrl.substring(0, 80) + '...',
        fileSize: file.size,
        fileType: file.type,
      });
      let uploadRes: Response;
      try {
        uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });
      } catch (networkErr) {
        console.error('[Upload] Step 2 network error:', networkErr);
        throw new Error(
          `直传 R2 失败: ${networkErr instanceof Error ? networkErr.message : '网络错误'}`,
        );
      }

      if (!uploadRes.ok) {
        const errText = await uploadRes.text().catch(() => '');
        console.error('[Upload] Step 2 response error:', uploadRes.status, errText);
        throw new Error(`文件上传失败 (${uploadRes.status})`);
      }

      // Step 3: 确认并创建 Media 记录 + 绑定
      const confirmRes = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          url: publicUrl,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          target: entityType,
          targetId: entityId,
          relation: relation,
        }),
      });

      if (!confirmRes.ok) {
        const errData = await confirmRes.json().catch(() => null);
        throw new Error(errData?.error || '确认上传失败');
      }

      setUploadStatus('done');
      router.refresh();
      setTimeout(() => setUploadStatus('idle'), 2000);
    } catch (err) {
      setUploadStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '上传失败');
      setTimeout(() => setUploadStatus('idle'), 4000);
    }
  };

  const handleRemove = async (mediaId: string) => {
    if (!onRemove) return;
    if (!confirm('确定移除此媒体？')) return;

    setRemovingId(mediaId);
    try {
      await onRemove(mediaId);
      router.refresh();
    } catch {
      // 静默处理，页面会刷新
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((item, index) => {
          const isVideo = item.type === 'VIDEO';
          const isRemoving = removingId === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                'group relative overflow-hidden rounded-[var(--radius-card)] bg-white/5 transition-all',
                isRemoving && 'pointer-events-none opacity-50',
                !editMode && !isVideo && 'cursor-pointer',
              )}
              onClick={!editMode && !isVideo ? () => setLightboxIndex(index) : undefined}
            >
              {/* 编辑模式：删除按钮 */}
              {editMode && onRemove && (
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-600/80 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {/* 非编辑模式：放大按钮 */}
              {!editMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(index);
                  }}
                  className={cn(
                    'absolute right-1.5 top-1.5 z-20 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70',
                    isVideo ? 'opacity-70' : 'opacity-0 group-hover:opacity-100',
                  )}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                    />
                  </svg>
                </button>
              )}

              {isVideo ? (
                <div className="relative aspect-[4/3]">
                  <video
                    src={item.url}
                    preload="auto"
                    playsInline
                    controls
                    className="h-full w-full object-contain"
                    onPlay={() =>
                      setPlayingSet((prev) => {
                        const next = new Set(prev);
                        next.add(item.id);
                        return next;
                      })
                    }
                    onPause={() =>
                      setPlayingSet((prev) => {
                        const next = new Set(prev);
                        next.delete(item.id);
                        return next;
                      })
                    }
                  />
                  {/* 播放图标覆盖层 — 仅在未播放时显示 */}
                  {!playingSet.has(item.id) && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                        <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.url}
                    alt={item.alt || '媒体文件'}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* 编辑模式：上传按钮 */}
        {editMode && (
          <button
            onClick={handleUploadClick}
            className={cn(
              'flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border-2 border-dashed transition-all',
              uploadStatus === 'idle'
                ? 'border-white/10 text-text-secondary hover:border-accent/50 hover:text-accent'
                : uploadStatus === 'uploading'
                  ? 'border-accent/30 text-accent'
                  : uploadStatus === 'done'
                    ? 'border-green-500/30 text-green-400'
                    : 'border-red-500/30 text-red-400',
            )}
          >
            {uploadStatus === 'idle' && (
              <>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="text-xs">上传图片/视频</span>
              </>
            )}

            {uploadStatus === 'uploading' && (
              <div className="flex flex-col items-center gap-2">
                <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span className="text-xs">上传中...</span>
              </div>
            )}

            {uploadStatus === 'done' && (
              <div className="flex flex-col items-center gap-1">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-xs">已上传</span>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs">{errorMsg}</span>
                <span className="text-[10px] text-text-muted">点击重试</span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Lightbox（非编辑模式） */}
      {lightboxIndex !== null && !editMode && (
        <LightboxViewer
          items={media.map(
            (item): GalleryItem => ({
              id: item.id,
              url: item.url,
              type: item.type,
              category: item.type === 'VIDEO' ? 'VIDEO' : null,
              alt: item.alt ?? null,
              caption: null,
              thumbnailUrl: null,
              filename: null,
              width: item.width ?? null,
              height: item.height ?? null,
              duration: null,
              createdAt: new Date().toISOString(),
              source: null,
              mediaTag: null,
            }),
          )}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={(index) => setLightboxIndex(index)}
        />
      )}
    </div>
  );
}
