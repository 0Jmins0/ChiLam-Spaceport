'use client';

import Image from 'next/image';
import AudioPlayer from './AudioPlayer';
import { EditableText } from '@/components/edit/EditableText';
import { useEditMode } from '@/components/edit/EditModeProvider';

interface InterviewMediaPanelProps {
  interviewId: string;
  mediaType: string;
  proofreadStatus: string;
  embedUrl: string | null;
  originalMediaUrl: string | null;
  galleryImages: { url: string; alt: string | null }[];
  summary: string | null;
  duration: string | null;
}

function ProofreadBadge({ status }: { status: string }) {
  const isVerified = status === 'PROOFREAD';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${
          isVerified ? 'border-accent bg-accent/10' : 'border-white/20 bg-white/5'
        }`}
      >
        {isVerified ? (
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            stroke="currentColor"
            className="text-accent"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 14l5 5L21 9" />
          </svg>
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            stroke="currentColor"
            className="text-white/30"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="14" cy="14" r="8" />
            <path d="M14 10v4M14 18h.01" />
          </svg>
        )}
      </div>
      <p className={`text-xs text-center ${isVerified ? 'text-accent' : 'text-text-muted'}`}>
        {isVerified ? (
          <>
            已校对
            <br />
            <span className="uppercase tracking-wider">Verified</span>
          </>
        ) : (
          <>
            待校对
            <br />
            <span className="uppercase tracking-wider">Pending</span>
          </>
        )}
      </p>
    </div>
  );
}

function AudioPlaceholder() {
  return (
    <div className="relative aspect-[4/3] rounded-[var(--radius-card)] bg-bg-darker overflow-hidden flex items-center justify-center">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 left-4 w-24 h-24 border border-white/20 rounded-full" />
        <div className="absolute bottom-6 right-6 w-16 h-16 border border-white/20 rounded-full" />
      </div>
      <div className="text-center z-10">
        <p className="text-2xl font-heading text-accent/60 mb-1">张智霖</p>
        <p className="text-sm text-text-muted tracking-widest uppercase">Julian Cheung</p>
      </div>
    </div>
  );
}

function MediaPlaceholder() {
  return (
    <div className="aspect-[3/4] rounded-[var(--radius-card)] bg-bg-darker flex items-center justify-center">
      <p className="text-text-muted italic text-sm">媒体资源整理中</p>
    </div>
  );
}

export default function InterviewMediaPanel({
  interviewId,
  mediaType,
  proofreadStatus,
  embedUrl,
  originalMediaUrl,
  galleryImages,
  summary,
  duration,
}: InterviewMediaPanelProps) {
  const { editMode } = useEditMode();

  const renderMedia = () => {
    // VIDEO with embed URL (or editable placeholder)
    if (mediaType === 'VIDEO') {
      return (
        <EditableText
          value={embedUrl || ''}
          entityType="interview"
          entityId={interviewId}
          field="embedUrl"
          placeholder="视频嵌入地址..."
          className="text-sm text-text-muted"
        >
          {embedUrl ? (
            <div className="relative">
              <iframe
                src={embedUrl}
                allowFullScreen
                className="w-full aspect-video rounded-[var(--radius-card)]"
                title="访谈视频"
              />
              {editMode && <div className="absolute inset-0 z-10 cursor-pointer" />}
            </div>
          ) : null}
        </EditableText>
      );
    }

    // AUDIO with media URL
    if (mediaType === 'AUDIO' && originalMediaUrl) {
      return (
        <div className="space-y-5">
          <AudioPlaceholder />
          <AudioPlayer src={originalMediaUrl} duration={duration || undefined} />
        </div>
      );
    }

    // TEXT with gallery images
    if (mediaType === 'TEXT' && galleryImages.length > 0) {
      return (
        <div className={`grid gap-3 ${galleryImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {galleryImages.map((img, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] rounded-[var(--radius-card)] border border-border-gold/20 overflow-hidden"
            >
              <Image
                src={img.url}
                alt={img.alt || `图片 ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 300px"
              />
            </div>
          ))}
        </div>
      );
    }

    // Fallback
    return <MediaPlaceholder />;
  };

  return (
    <div className="space-y-6">
      {/* Proofread Badge */}
      <div className="flex justify-end">
        <EditableText
          value={proofreadStatus}
          entityType="interview"
          entityId={interviewId}
          field="proofreadStatus"
          className="text-sm"
          placeholder="校对状态(PROOFREAD/UNPROOFREAD)..."
        >
          <ProofreadBadge status={proofreadStatus} />
        </EditableText>
      </div>

      {/* Media Area */}
      <div>{renderMedia()}</div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      {/* Editor's Note */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-accent">编者备注</p>
          <p className="text-xs text-text-muted uppercase tracking-wider">Editor&apos;s Note</p>
        </div>

        <EditableText
          value={summary}
          entityType="interview"
          entityId={interviewId}
          field="summary"
          as="p"
          multiline
          className="text-sm text-text-secondary leading-relaxed"
          placeholder="编辑笔记..."
        >
          {summary ? (
            <span className="text-sm text-text-secondary leading-relaxed">{summary}</span>
          ) : (
            <span className="text-sm text-text-muted italic">暂无编者备注</span>
          )}
        </EditableText>

        {/* Duration (editable) */}
        <EditableText
          value={duration}
          entityType="interview"
          entityId={interviewId}
          field="duration"
          as="p"
          className="text-sm text-text-secondary"
          placeholder="时长(分钟)..."
        >
          {duration ? (
            <span className="text-sm text-text-secondary">{duration}</span>
          ) : null}
        </EditableText>

        {/* Decorative signature line */}
        <div className="flex justify-end pt-2">
          <div className="w-16 h-px bg-accent/20" />
        </div>
      </div>
    </div>
  );
}
