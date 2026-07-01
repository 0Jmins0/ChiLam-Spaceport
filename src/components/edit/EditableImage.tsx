'use client';

import { useEffect, useState, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useEditMode } from './EditModeProvider';

interface EditableImageProps {
  src: string | null | undefined;
  entityType: string;
  entityId: string;
  field: string;
  alt?: string;
  className?: string;
  children: ReactNode;
}

type UploadStatus = 'idle' | 'uploading' | 'saving' | 'done' | 'error';

function inferDirectMediaRelation(field: string) {
  if (field === 'posterId') return 'poster';
  if (field === 'coverId' || field === 'coverImageId') return 'cover';
  if (field === 'originalMediaId') return 'media';
  return field;
}

export function EditableImage({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  src,
  entityType,
  entityId,
  field,
  alt,
  className,
  children,
}: EditableImageProps) {
  const { editMode, adminToken, sessionId, registerMediaReplace } = useEditMode();
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editMode) return;
    Promise.resolve().then(() => {
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
    });
  }, [editMode]);

  if (!editMode) {
    return <>{children}</>;
  }

  const handleClick = () => {
    if (status === 'uploading' || status === 'saving') return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be re-selected
    e.target.value = '';

    setStatus('uploading');
    setProgress(0);
    setErrorMsg('');

    try {
      const currentSessionId = sessionId;
      if (!currentSessionId) throw new Error('编辑会话未初始化');

      const presignRes = await fetch('/api/admin/edit/uploads/presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          filename: file.name,
          mimeType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignRes.ok) {
        const errData = await presignRes.json().catch(() => null);
        throw new Error(errData?.error || '获取临时上传链接失败');
      }

      const { uploadUrl, tempKey, publicTempUrl } = await presignRes.json();
      setProgress(30);

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`临时上传失败 (${uploadRes.status})`);
      }

      setStatus('saving');
      setProgress(80);
      const nextPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextPreviewUrl;
      });

      registerMediaReplace({
        target: entityType,
        targetId: entityId,
        relation: inferDirectMediaRelation(field),
        tempKey,
        tempUrl: publicTempUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        alt: alt ?? null,
      });

      setProgress(100);
      setStatus('done');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '上传失败');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className={cn('group/editable-img relative', className)}>
      {children}
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={alt || '待保存图片'}
          className="absolute inset-0 z-[1] h-full w-full rounded-[var(--radius-card)] object-cover"
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Overlay */}
      <div
        onClick={handleClick}
        className={cn(
          'absolute inset-0 z-[2] flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] transition-all duration-200',
          status === 'idle'
            ? 'bg-bg-darker/0 opacity-0 group-hover/editable-img:bg-bg-darker/60 group-hover/editable-img:opacity-100'
            : 'bg-bg-darker/70 opacity-100',
        )}
      >
        {status === 'idle' && (
          <div className="flex flex-col items-center gap-2 text-accent">
            {/* Camera icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"
              />
            </svg>
            <span className="text-xs font-medium tracking-wide">替换图片</span>
          </div>
        )}

        {(status === 'uploading' || status === 'saving') && (
          <div className="flex flex-col items-center gap-3">
            {/* Spinner */}
            <svg className="h-6 w-6 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
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
            <span className="text-xs text-text-secondary">
              {status === 'uploading' ? '上传中...' : '保存中...'}
            </span>
            {/* Progress bar */}
            <div className="h-1 w-24 overflow-hidden rounded-full bg-bg-darker/50">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="flex flex-col items-center gap-1 text-green-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="text-xs">已更新</span>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-1 text-red-400">
            <span className="text-xs">{errorMsg}</span>
            <span className="text-[10px] text-text-muted">点击重试</span>
          </div>
        )}
      </div>
    </div>
  );
}
