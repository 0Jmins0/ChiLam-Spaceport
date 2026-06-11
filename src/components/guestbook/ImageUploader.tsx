'use client';

import { useState, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

export interface ImageCropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageUploaderProps {
  onImageUploaded: (data: { mediaId: string; url: string; cropData: ImageCropData | null }) => void;
  onImageRemoved: () => void;
  currentImage?: { url: string } | null;
  className?: string;
}

export interface ImageUploaderRef {
  reset: () => void;
}

type UploaderState = 'idle' | 'uploading' | 'done';

export const ImageUploader = forwardRef<ImageUploaderRef, ImageUploaderProps>(
  function ImageUploader({ onImageUploaded, onImageRemoved, currentImage, className = '' }, ref) {
    const [state, setState] = useState<UploaderState>(currentImage ? 'done' : 'idle');
    const [error, setError] = useState<string | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImage?.url ?? null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetAll = useCallback(() => {
      setState('idle');
      setUploadedUrl(null);
      setError(null);
    }, []);

    useImperativeHandle(ref, () => ({ reset: resetAll }), [resetAll]);

    const handleFileSelect = useCallback(() => {
      fileInputRef.current?.click();
    }, []);

    // 选图后直接上传
    const handleFileChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
          setError('请选择图片文件');
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          setError('图片大小不能超过 10MB');
          return;
        }

        e.target.value = '';
        setError(null);
        setState('uploading');

        try {
          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch('/api/upload', { method: 'POST', body: formData });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || '上传失败');
          }

          const data = await res.json();

          setUploadedUrl(data.url);
          setState('done');

          onImageUploaded({ mediaId: data.media?.id ?? '', url: data.url, cropData: null });
        } catch (err) {
          setError(err instanceof Error ? err.message : '上传失败，请重试');
          setState('idle');
        }
      },
      [onImageUploaded],
    );

    const handleRemove = useCallback(() => {
      resetAll();
      onImageRemoved();
    }, [resetAll, onImageRemoved]);

    return (
      <div className={className}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {error && <p className="mb-2 text-xs text-red-400">{error}</p>}

        {/* Idle: 上传按钮 */}
        {state === 'idle' && (
          <button
            type="button"
            onClick={handleFileSelect}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-gold/50 bg-bg-darker px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            <span>&#128247;</span>
            <span>添加图片</span>
          </button>
        )}

        {/* Uploading */}
        {state === 'uploading' && (
          <div className="inline-flex items-center gap-2 rounded-md border border-border-gold/50 bg-bg-darker px-3 py-2 text-xs text-text-muted">
            <svg className="h-4 w-4 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>上传中...</span>
          </div>
        )}

        {/* Done: 缩略图 + 删除 */}
        {state === 'done' && uploadedUrl && (
          <div className="inline-flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={uploadedUrl} alt="上传的图片" className="h-16 w-16 rounded object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="flex h-5 w-5 items-center justify-center rounded-full bg-bg-darker text-xs text-text-muted transition-colors hover:bg-red-500/20 hover:text-red-400"
              title="移除图片"
            >
              &#10005;
            </button>
          </div>
        )}
      </div>
    );
  },
);
