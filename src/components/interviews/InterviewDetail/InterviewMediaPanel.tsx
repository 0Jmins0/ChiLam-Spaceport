'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import AudioPlayer from './AudioPlayer';
import { EditableText } from '@/components/edit/EditableText';
import { EditableMediaGallery } from '@/components/edit/EditableMediaGallery';
import MarkdownContent from '@/components/ui/MarkdownContent';
import { LightboxViewer } from '@/components/gallery/LightboxViewer';
import { useEditMode } from '@/components/edit/EditModeProvider';
import type { GalleryItem } from '@/lib/types';

interface InterviewMediaPanelProps {
  interviewId: string;
  mediaType: string;
  proofreadStatus: string;
  embedUrl: string | null;
  originalMediaUrl: string | null;
  galleryImages: { id: string; url: string; alt: string | null; type: string }[];
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Separate gallery videos and images
  const galleryVideos = galleryImages.filter((m) => m.type === 'VIDEO');
  const allGalleryMedia = galleryImages; // all items for thumbnails
  const hasGalleryVideos = galleryVideos.length > 0;

  // Clamp activeIndex to valid range
  const safeIndex = useMemo(
    () => (allGalleryMedia.length === 0 ? 0 : Math.min(activeIndex, allGalleryMedia.length - 1)),
    [activeIndex, allGalleryMedia.length],
  );

  // Convert galleryImages to GalleryItem format for LightboxViewer
  const lightboxItems: GalleryItem[] = allGalleryMedia.map((m) => ({
    id: m.id,
    type: m.type,
    category: null,
    mediaTag: null,
    url: m.url,
    thumbnailUrl: null,
    filename: null,
    width: null,
    height: null,
    duration: null,
    alt: m.alt,
    caption: m.alt,
    createdAt: '',
    source: null,
  }));

  const renderMedia = () => {
    // VIDEO type
    if (mediaType === 'VIDEO') {
      const videoContent = hasGalleryVideos ? (
        <div className="space-y-3">
          {/* Main video player */}
          <div className="relative cursor-pointer group" onClick={() => setLightboxOpen(true)}>
            {allGalleryMedia[safeIndex]?.type === 'VIDEO' ? (
              <video
                key={allGalleryMedia[safeIndex].id}
                src={allGalleryMedia[safeIndex].url}
                controls
                preload="metadata"
                className="w-full aspect-video rounded-[var(--radius-card)]"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="relative aspect-video rounded-[var(--radius-card)] overflow-hidden">
                <Image
                  src={allGalleryMedia[safeIndex].url}
                  alt={allGalleryMedia[safeIndex].alt || '图片'}
                  fill
                  className="object-contain"
                  sizes="350px"
                />
              </div>
            )}
            {/* Fullscreen hint overlay */}
            <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9m11.25-5.25v4.5m0-4.5h-4.5m4.5 0L15 9m-11.25 11.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15"
                />
              </svg>
            </div>
          </div>

          {/* Thumbnail grid - only when ≥2 media items */}
          {allGalleryMedia.length >= 2 && (
            <div className="grid grid-cols-4 gap-1.5">
              {allGalleryMedia.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => setActiveIndex(i)}
                  className={`relative aspect-video rounded overflow-hidden border-2 transition-colors ${
                    i === safeIndex ? 'border-accent' : 'border-transparent hover:border-white/30'
                  }`}
                >
                  {m.type === 'VIDEO' ? (
                    <>
                      <video
                        src={m.url}
                        preload="metadata"
                        muted
                        className="w-full h-full object-cover"
                      />
                      {/* Play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <Image
                      src={m.url}
                      alt={m.alt || `缩略图 ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : embedUrl ? (
        // Fallback to iframe when no gallery videos
        <div className="relative">
          <iframe
            src={embedUrl}
            allowFullScreen
            className="w-full aspect-video rounded-[var(--radius-card)]"
            title="访谈视频"
          />
          {editMode && <div className="absolute inset-0 z-10 cursor-pointer" />}
        </div>
      ) : (
        <MediaPlaceholder />
      );

      return (
        <div className="space-y-3">
          {/* embedUrl editable (as fallback option for admin) */}
          <EditableText
            value={embedUrl || ''}
            entityType="interview"
            entityId={interviewId}
            field="embedUrl"
            placeholder="视频嵌入地址..."
            className="text-sm text-text-muted"
          >
            {videoContent}
          </EditableText>

          {/* EditableMediaGallery for upload/delete */}
          {editMode && (
            <EditableMediaGallery
              media={galleryImages.map((img) => ({
                id: img.id,
                url: img.url,
                type: img.type,
                alt: img.alt,
              }))}
              entityType="interview"
              entityId={interviewId}
              relation="gallery"
            />
          )}
        </div>
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
        <div className="space-y-3">
          <div
            className={`grid gap-3 ${galleryImages.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}
          >
            {galleryImages.map((img, i) => (
              <div
                key={img.id}
                className="relative aspect-[3/4] rounded-[var(--radius-card)] border border-border-gold/20 overflow-hidden"
              >
                <Image
                  src={img.url}
                  alt={img.alt || `图片 ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 50vw, 300px"
                />
              </div>
            ))}
          </div>

          {editMode && (
            <EditableMediaGallery
              media={galleryImages.map((img) => ({
                id: img.id,
                url: img.url,
                type: img.type,
                alt: img.alt,
              }))}
              entityType="interview"
              entityId={interviewId}
              relation="gallery"
            />
          )}
        </div>
      );
    }

    // TEXT with no images but in edit mode - still show EditableMediaGallery
    if (mediaType === 'TEXT' && editMode) {
      return (
        <div className="space-y-3">
          <MediaPlaceholder />
          <EditableMediaGallery
            media={[]}
            entityType="interview"
            entityId={interviewId}
            relation="gallery"
          />
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

      {/* Lightbox */}
      {lightboxOpen && lightboxItems.length > 0 && (
        <LightboxViewer
          items={lightboxItems}
          currentIndex={safeIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setActiveIndex}
        />
      )}

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
            <MarkdownContent
              content={summary}
              className="text-sm text-text-secondary leading-relaxed"
            />
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
          {duration ? <span className="text-sm text-text-secondary">{duration}</span> : null}
        </EditableText>

        {/* Decorative signature line */}
        <div className="flex justify-end pt-2">
          <div className="w-16 h-px bg-accent/20" />
        </div>
      </div>
    </div>
  );
}
