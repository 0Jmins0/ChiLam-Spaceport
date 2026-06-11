'use client';

import { useState, useRef, useCallback } from 'react';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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

type UploaderState = 'idle' | 'cropping' | 'uploading' | 'done';

export function ImageUploader({
  onImageUploaded,
  onImageRemoved,
  currentImage,
  className = '',
}: ImageUploaderProps) {
  const [state, setState] = useState<UploaderState>(currentImage ? 'done' : 'idle');
  const [imageSrc, setImageSrc] = useState<string | null>(currentImage?.url ?? null);
  const [crop, setCrop] = useState<Crop>();
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(currentImage?.url ?? null);
  const [cropData, setCropData] = useState<ImageCropData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const originalFileRef = useRef<File | null>(null);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('图片大小不能超过 10MB');
      return;
    }

    setError(null);
    originalFileRef.current = file;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setState('cropping');
      setCrop(undefined);
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = '';
  }, []);

  const handleCropConfirm = useCallback(async () => {
    if (!originalFileRef.current || !imgRef.current) return;

    const image = imgRef.current;

    // Calculate crop data as percentages of the original image
    let finalCropData: ImageCropData | null = null;
    if (crop && crop.width > 0 && crop.height > 0) {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      finalCropData = {
        x: (crop.x * scaleX) / image.naturalWidth,
        y: (crop.y * scaleY) / image.naturalHeight,
        width: (crop.width * scaleX) / image.naturalWidth,
        height: (crop.height * scaleY) / image.naturalHeight,
      };
    }

    setState('uploading');
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', originalFileRef.current);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '上传失败');
      }

      const data = await res.json();

      setCropData(finalCropData);
      setUploadedUrl(data.url);
      setState('done');

      onImageUploaded({
        mediaId: data.media?.id ?? '',
        url: data.url,
        cropData: finalCropData,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试');
      setState('cropping');
    }
  }, [crop, onImageUploaded]);

  const handleCancel = useCallback(() => {
    setState('idle');
    setImageSrc(null);
    setCrop(undefined);
    originalFileRef.current = null;
    setError(null);
  }, []);

  const handleRemove = useCallback(() => {
    setState('idle');
    setImageSrc(null);
    setUploadedUrl(null);
    setCrop(undefined);
    setCropData(null);
    originalFileRef.current = null;
    setError(null);
    onImageRemoved();
  }, [onImageRemoved]);

  // For the thumbnail, we use a wrapper div with overflow hidden and position the image
  const renderCroppedThumbnail = () => {
    if (!uploadedUrl) return null;

    if (!cropData) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={uploadedUrl}
          alt="上传的图片"
          className="h-16 w-16 rounded object-cover"
        />
      );
    }

    // Use background-image with background-position to show cropped region
    const bgPosX = (cropData.x / (1 - cropData.width)) * 100;
    const bgPosY = (cropData.y / (1 - cropData.height)) * 100;
    const bgSizeX = (1 / cropData.width) * 100;

    return (
      <div
        className="h-16 w-16 rounded bg-no-repeat"
        style={{
          backgroundImage: `url(${uploadedUrl})`,
          backgroundPosition: `${isFinite(bgPosX) ? bgPosX : 0}% ${isFinite(bgPosY) ? bgPosY : 0}%`,
          backgroundSize: `${bgSizeX}% auto`,
        }}
      />
    );
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="mb-2 text-xs text-red-400">{error}</p>
      )}

      {/* Idle state: upload button */}
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

      {/* Cropping state */}
      {state === 'cropping' && imageSrc && (
        <div className="space-y-3 rounded-lg border border-border-gold/50 bg-bg-darker p-3">
          <p className="text-xs text-text-muted">拖拽选择裁切区域（可选）</p>
          <div className="flex justify-center">
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageSrc}
                alt="待裁切的图片"
                className="max-h-64 rounded"
                onLoad={() => {
                  // Reset crop when new image loads
                  setCrop(undefined);
                }}
              />
            </ReactCrop>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCropConfirm}
              className="rounded-md bg-accent/20 px-3 py-1.5 text-xs text-accent transition-colors hover:bg-accent/30"
            >
              确认裁切
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-border-gold/30 px-3 py-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Uploading state */}
      {state === 'uploading' && (
        <div className="inline-flex items-center gap-2 rounded-md border border-border-gold/50 bg-bg-darker px-3 py-2 text-xs text-text-muted">
          <svg
            className="h-4 w-4 animate-spin text-accent"
            viewBox="0 0 24 24"
            fill="none"
          >
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

      {/* Done state: thumbnail + remove button */}
      {state === 'done' && uploadedUrl && (
        <div className="inline-flex items-center gap-2">
          {renderCroppedThumbnail()}
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

      {/* Hidden style override to remove default ReactCrop styling that clashes with dark theme */}
      {state === 'cropping' && (
        <style>{`
          .ReactCrop__crop-selection {
            border-color: var(--color-accent) !important;
          }
          .ReactCrop__drag-handle::after {
            border-color: var(--color-accent) !important;
          }
        `}</style>
      )}
    </div>
  );
}
