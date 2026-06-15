'use client';

import { useState, useRef, useCallback } from 'react';
import InterviewTranscript from './InterviewTranscript';
import InterviewMediaPanel from './InterviewMediaPanel';

interface InterviewContentAreaProps {
  interviewId: string;
  // Transcript props
  title: string;
  titleEn?: string;
  date: Date;
  proofreadStatus: string;
  transcriptCantonese: unknown;
  transcriptMandarin: unknown;
  // MediaPanel props
  mediaType: string;
  embedUrl: string | null;
  originalMediaUrl: string | null;
  galleryImages: { id: string; url: string; alt: string | null; type: string }[];
  summary: string | null;
  duration: string | null;
}

export default function InterviewContentArea({
  interviewId,
  title,
  titleEn,
  date,
  proofreadStatus,
  transcriptCantonese,
  transcriptMandarin,
  mediaType,
  embedUrl,
  originalMediaUrl,
  galleryImages,
  summary,
  duration,
}: InterviewContentAreaProps) {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);

  // 判断是否可以联动（只有 VIDEO 或 AUDIO 类型且有可控播放源）
  // embedUrl (iframe) 无法控制，所以不启用
  const hasControllableMedia =
    (mediaType === 'VIDEO' && galleryImages.some((m) => m.type === 'VIDEO')) ||
    (mediaType === 'AUDIO' && !!originalMediaUrl);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleTimestampClick = useCallback((seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = seconds;
      // 如果已暂停，点击后自动播放
      if (mediaRef.current.paused) {
        mediaRef.current.play().catch(() => {});
      }
    }
  }, []);

  return (
    <>
      {/* 中栏 - Transcript */}
      <div className="flex-1 min-w-0">
        <InterviewTranscript
          interviewId={interviewId}
          title={title}
          titleEn={titleEn}
          date={date}
          proofreadStatus={proofreadStatus}
          transcriptCantonese={transcriptCantonese}
          transcriptMandarin={transcriptMandarin}
          currentTime={hasControllableMedia ? currentTime : undefined}
          onTimestampClick={hasControllableMedia ? handleTimestampClick : undefined}
        />
      </div>

      {/* 右栏 - MediaPanel（仅桌面端，移动端已在顶部显示） */}
      <div className="hidden lg:block lg:w-[350px] shrink-0">
        <div className="lg:sticky lg:top-24">
          <InterviewMediaPanel
            interviewId={interviewId}
            mediaType={mediaType}
            proofreadStatus={proofreadStatus}
            embedUrl={embedUrl}
            originalMediaUrl={originalMediaUrl}
            galleryImages={galleryImages}
            summary={summary}
            duration={duration}
            onTimeUpdate={hasControllableMedia ? handleTimeUpdate : undefined}
            mediaRef={hasControllableMedia ? mediaRef : undefined}
          />
        </div>
      </div>
    </>
  );
}
