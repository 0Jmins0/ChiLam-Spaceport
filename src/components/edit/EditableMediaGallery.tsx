'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { getMediaAspectRatio } from '@/lib/update-media';
import { useEditMode } from './EditModeProvider';
import { LightboxViewer } from '@/components/gallery/LightboxViewer';
import type { GalleryItem } from '@/lib/types';
import type { EditMediaRemoveOperation, EditPendingOperation } from './types';

interface MediaItem {
  id: string;
  url: string;
  type: string; // 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE'
  alt?: string | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
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

type UploadResult = {
  key: string;
  publicUrl: string;
};

type MediaMetadata = {
  width?: number;
  height?: number;
  duration?: number;
};

function isMediaRemoveOperation(
  operation: EditPendingOperation,
): operation is EditMediaRemoveOperation {
  return operation.type === 'media_remove';
}

async function uploadFileToTempR2(
  file: File,
  sessionId: string,
  adminToken?: string | null,
): Promise<UploadResult> {
  const presignRes = await fetch('/api/admin/edit/uploads/presign', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    },
    body: JSON.stringify({
      sessionId,
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
    }),
  });

  if (!presignRes.ok) {
    const errData = await presignRes.json().catch(() => null);
    throw new Error(errData?.error || '获取上传链接失败');
  }

  const { uploadUrl, publicTempUrl, tempKey } = await presignRes.json();

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text().catch(() => '');
    console.error('[Upload] R2 response error:', uploadRes.status, errText);
    throw new Error(`文件上传失败 (${uploadRes.status})`);
  }

  return { key: tempKey, publicUrl: publicTempUrl };
}

function getImageMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('读取图片尺寸失败'));
    };
    img.src = url;
  });
}

function waitForVideoEvent(video: HTMLVideoElement, eventName: string) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('读取视频信息超时'));
    }, 5000);

    function cleanup() {
      window.clearTimeout(timeout);
      video.removeEventListener(eventName, handleEvent);
      video.removeEventListener('error', handleError);
    }

    function handleEvent() {
      cleanup();
      resolve();
    }

    function handleError() {
      cleanup();
      reject(new Error('读取视频信息失败'));
    }

    video.addEventListener(eventName, handleEvent, { once: true });
    video.addEventListener('error', handleError, { once: true });
  });
}

async function getVideoMetadataAndThumbnail(file: File): Promise<{
  metadata: MediaMetadata;
  thumbnailFile: File | null;
}> {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;
  video.src = url;

  try {
    await waitForVideoEvent(video, 'loadedmetadata');

    const metadata: MediaMetadata = {
      width: video.videoWidth || undefined,
      height: video.videoHeight || undefined,
      duration: Number.isFinite(video.duration) ? video.duration : undefined,
    };

    if (!metadata.width || !metadata.height) {
      return { metadata, thumbnailFile: null };
    }

    const seekTime = metadata.duration && metadata.duration > 0.2 ? 0.1 : 0;
    if (seekTime > 0) {
      const seekedPromise = waitForVideoEvent(video, 'seeked').catch(() => undefined);
      video.currentTime = seekTime;
      await seekedPromise;
    } else if (video.readyState < 2) {
      await waitForVideoEvent(video, 'loadeddata').catch(() => undefined);
    }

    const maxWidth = 1280;
    const scale = Math.min(1, maxWidth / metadata.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(metadata.width * scale);
    canvas.height = Math.round(metadata.height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return { metadata, thumbnailFile: null };
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.82),
    );
    if (!blob) return { metadata, thumbnailFile: null };

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'video-cover';
    const thumbnailFile = new File([blob], `${baseName}-cover.jpg`, { type: 'image/jpeg' });
    return { metadata, thumbnailFile };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function EditableMediaGallery({
  media,
  entityType,
  entityId,
  relation,
  className,
}: EditableMediaGalleryProps) {
  const {
    editMode,
    adminToken,
    sessionId,
    pendingOperations,
    registerMediaRemove,
    registerTempUpload,
  } = useEditMode();
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [pendingMedia, setPendingMedia] = useState<MediaItem[]>([]);
  const [playingSet, setPlayingSet] = useState<Set<string>>(new Set());
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode) return;
    Promise.resolve().then(() => {
      setRemovedIds(new Set());
      setPendingMedia((items) => {
        for (const item of items) {
          if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
          if (item.thumbnailUrl?.startsWith('blob:')) URL.revokeObjectURL(item.thumbnailUrl);
        }
        return [];
      });
    });
  }, [editMode]);

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
      let metadata: MediaMetadata = {};
      if (file.type.startsWith('image/')) {
        metadata = await getImageMetadata(file);
      } else if (file.type.startsWith('video/')) {
        const videoResult = await getVideoMetadataAndThumbnail(file);
        metadata = videoResult.metadata;
      }

      if (!sessionId) throw new Error('编辑会话未初始化');
      const { key, publicUrl } = await uploadFileToTempR2(file, sessionId, adminToken);

      const objectUrl = URL.createObjectURL(file);
      const pendingId = `pending-${crypto.randomUUID()}`;
      const pendingItem: MediaItem = {
        id: pendingId,
        url: objectUrl,
        type: file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        alt: file.name,
        thumbnailUrl: file.type.startsWith('video/') ? undefined : null,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        duration: metadata.duration ?? null,
      };

      setPendingMedia((current) => [...current, pendingItem]);
      registerTempUpload({
        target: entityType,
        targetId: entityId,
        relation,
        tempKey: key,
        tempUrl: publicUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        duration: metadata.duration ?? null,
      });

      setUploadStatus('done');
      setTimeout(() => setUploadStatus('idle'), 2000);
    } catch (err) {
      setUploadStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '上传失败');
      setTimeout(() => setUploadStatus('idle'), 4000);
    }
  };

  const pendingRemovedIds = useMemo(
    () =>
      new Set(
        pendingOperations
          .filter(isMediaRemoveOperation)
          .filter(
            (operation) =>
              operation.target === entityType &&
              operation.targetId === entityId &&
              operation.relation === relation,
          )
          .map((operation) => operation.mediaId),
      ),
    [entityId, entityType, pendingOperations, relation],
  );

  const visibleRemovedIds = useMemo(
    () => new Set([...Array.from(removedIds), ...Array.from(pendingRemovedIds)]),
    [pendingRemovedIds, removedIds],
  );

  const handleRemove = (mediaId: string) => {
    if (visibleRemovedIds.has(mediaId)) return;
    if (!confirm('确定移除此媒体？')) return;

    setRemovedIds((current) => {
      const next = new Set(current);
      next.add(mediaId);
      return next;
    });
    registerMediaRemove({
      target: entityType,
      targetId: entityId,
      relation,
      mediaId,
    });
  };

  const visibleMedia = [
    ...media.filter((item) => !visibleRemovedIds.has(item.id)),
    ...pendingMedia,
  ];

  // 非编辑模式下，无媒体则不渲染
  if (!editMode && visibleMedia.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {visibleMedia.map((item, index) => {
          const isVideo = item.type === 'VIDEO';
          const isPending = item.id.startsWith('pending-');
          const previewUrl = isVideo ? item.thumbnailUrl : item.url;
          const aspectRatio = getMediaAspectRatio(item);

          return (
            <div
              key={item.id}
              className={cn(
                'group relative overflow-hidden rounded-[var(--radius-card)] bg-white/5 transition-all',
                isPending && 'ring-1 ring-accent/50',
                !editMode && !isVideo && 'cursor-pointer',
              )}
              onClick={!editMode && !isVideo ? () => setLightboxIndex(index) : undefined}
            >
              {/* 编辑模式：删除按钮 */}
              {editMode && !isPending && (
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
                <div className="relative" style={{ aspectRatio }}>
                  <video
                    src={item.url}
                    poster={item.thumbnailUrl ?? undefined}
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
                <div className="relative" style={{ aspectRatio }}>
                  <Image
                    src={previewUrl ?? item.url}
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
          items={visibleMedia.map(
            (item): GalleryItem => ({
              id: item.id,
              url: item.url,
              type: item.type,
              category: item.type === 'VIDEO' ? 'VIDEO' : null,
              alt: item.alt ?? null,
              caption: null,
              thumbnailUrl: item.thumbnailUrl ?? null,
              filename: null,
              width: item.width ?? null,
              height: item.height ?? null,
              duration: item.duration ?? null,
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
