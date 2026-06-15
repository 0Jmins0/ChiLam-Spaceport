'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { EditableText } from '@/components/edit/EditableText';

interface TranscriptSegment {
  speaker: string;
  speakerLabel?: string;
  timestamp?: string;
  text: string;
}

interface TranscriptData {
  segments: TranscriptSegment[];
}

interface InterviewTranscriptProps {
  interviewId: string;
  title: string;
  titleEn?: string;
  date: Date;
  proofreadStatus: string;
  transcriptCantonese: unknown;
  transcriptMandarin: unknown;
  currentTime?: number;
  onTimestampClick?: (seconds: number) => void;
}

type LangTab = 'cantonese' | 'mandarin';

function parseTranscript(data: unknown): TranscriptData | string | null {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (parsed?.segments && Array.isArray(parsed.segments)) return parsed as TranscriptData;
      return data;
    } catch {
      return data;
    }
  }
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    if (obj.segments && Array.isArray(obj.segments)) return data as TranscriptData;
  }
  return null;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/** 将 "00:00" / "02:15" / "1:30:00" 格式的时间戳解析为秒数 */
function parseTimestampToSeconds(ts: string): number {
  const parts = ts.split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

/* 无需独立 SpeakerBadge — drop-cap 字母直接内联在 SegmentList */

function SegmentList({
  segments,
  currentTime,
  onTimestampClick,
}: {
  segments: TranscriptSegment[];
  currentTime?: number;
  onTimestampClick?: (seconds: number) => void;
}) {
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeSegmentIndex = useMemo(() => {
    if (currentTime === undefined || currentTime < 0) return -1;
    let activeIdx = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].timestamp) {
        const ts = parseTimestampToSeconds(segments[i].timestamp!);
        if (ts <= currentTime) {
          activeIdx = i;
        } else {
          break;
        }
      }
    }
    return activeIdx;
  }, [segments, currentTime]);

  useEffect(() => {
    if (activeSegmentIndex >= 0 && segmentRefs.current[activeSegmentIndex]) {
      segmentRefs.current[activeSegmentIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeSegmentIndex]);

  return (
    <div className="relative">
      {/* 左侧金色时间线 */}
      <div className="absolute left-[3px] top-2 bottom-2 w-px bg-accent/15" />

      <div className="space-y-0">
        {segments.map((seg, i) => {
          const hasTimestamp = !!seg.timestamp;
          const isActive = i === activeSegmentIndex;
          const isClickable = hasTimestamp && !!onTimestampClick;
          const letter = seg.speaker.charAt(0).toUpperCase();

          return (
            <div
              key={i}
              ref={(el) => {
                segmentRefs.current[i] = el;
              }}
              className={`relative ${isClickable ? 'cursor-pointer group/seg' : ''}`}
              onClick={() => {
                if (isClickable) {
                  onTimestampClick!(parseTimestampToSeconds(seg.timestamp!));
                }
              }}
            >
              {/* 发光圆点 — 框左边缘垂直居中 */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full transition-all duration-500 ${
                  isActive ? 'bg-accent shadow-[0_0_8px_rgba(196,155,99,0.6)]' : 'bg-accent/20'
                }`}
              />

              {/*
                内容框：
                - 左边有细边线
                - 上/下边线从左往右渐隐
                - 右边无边线
                用 border-left + 伪元素模拟上下渐隐边线
              */}
              <div
                className="relative ml-5 border-l border-white/[0.08] pl-4 py-4"
                style={{
                  maskImage: undefined /* 不 mask 内容 */,
                }}
              >
                {/* 上边线 — 从左到右渐隐 */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
                {/* 下边线 — 仅最后一个段落显示 */}
                {i === segments.length - 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-white/[0.08] to-transparent" />
                )}

                {/* Drop-cap 布局 */}
                <div className="relative">
                  <div className="float-left mr-3 flex flex-col items-center w-8">
                    <span
                      className={`font-heading text-[2rem] leading-none font-bold select-none transition-all duration-500 ${
                        isActive
                          ? 'text-[#e8d5be] drop-shadow-[0_0_14px_rgba(196,155,99,0.9)]'
                          : 'text-[#7a6b55]'
                      }`}
                    >
                      {letter}
                    </span>
                    {seg.timestamp && (
                      <span
                        className={`font-mono text-[10px] mt-1 whitespace-nowrap transition-all duration-500 ${
                          isActive ? 'text-accent/50' : 'text-white/15'
                        }`}
                      >
                        {seg.timestamp}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-[15px] leading-[1.85] pt-[3px] transition-all duration-500 ${
                      isActive
                        ? 'text-[#e8ddd0] drop-shadow-[0_0_20px_rgba(196,155,99,0.2)]'
                        : 'text-[#7a7068]'
                    }`}
                  >
                    {seg.text}
                  </p>

                  <div className="clear-both" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function InterviewTranscript({
  interviewId,
  title,
  titleEn,
  date,
  proofreadStatus,
  transcriptCantonese,
  transcriptMandarin,
  currentTime,
  onTimestampClick,
}: InterviewTranscriptProps) {
  const parsedCantonese = parseTranscript(transcriptCantonese);
  const parsedMandarin = parseTranscript(transcriptMandarin);

  const hasCantonese = parsedCantonese !== null;
  const hasMandarin = parsedMandarin !== null;
  const hasBoth = hasCantonese && hasMandarin;

  const defaultTab: LangTab = hasCantonese ? 'cantonese' : 'mandarin';
  const [activeTab, setActiveTab] = useState<LangTab>(defaultTab);

  const activeTranscript = activeTab === 'cantonese' ? parsedCantonese : parsedMandarin;

  const isProofread = proofreadStatus === 'PROOFREAD';

  return (
    <div className="space-y-8">
      {/* Title area */}
      <div className="space-y-3">
        <EditableText
          value={title}
          entityType="interview"
          entityId={interviewId}
          field="title"
          className="font-heading text-2xl md:text-[1.75rem] lg:text-[2rem] leading-snug text-text-primary font-semibold"
          placeholder="标题..."
        >
          <h1 className="font-heading text-2xl md:text-[1.75rem] lg:text-[2rem] leading-snug text-text-primary font-semibold">
            {title}
          </h1>
        </EditableText>
        <EditableText
          value={titleEn || ''}
          entityType="interview"
          entityId={interviewId}
          field="titleEn"
          className="text-base text-text-secondary italic mt-2"
          placeholder="英文标题..."
        >
          {titleEn ? (
            <span className="text-base text-text-secondary italic mt-2">{titleEn}</span>
          ) : null}
        </EditableText>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-base text-text-muted font-mono">{formatDate(date)}</span>
          <span className="text-text-muted/30">|</span>
          <span className="border border-accent/30 rounded-full px-3 py-0.5 text-xs text-accent">
            訪談節錄（節選）
            <span className="ml-1.5 opacity-60 uppercase tracking-wider text-[10px]">Excerpt</span>
          </span>
          <span className="text-text-muted/30">|</span>
          {isProofread ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/15 text-accent border border-accent/30">
              已校对
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/5 text-text-muted border border-white/10">
              待校对
            </span>
          )}
        </div>
      </div>

      {/* Language toggle — 紧凑优雅胶囊 */}
      {hasBoth && (
        <div className="flex justify-center">
          <div className="relative flex rounded-full border border-border-gold/30 bg-bg-darker/80 overflow-hidden w-full max-w-md">
            {/* 滑动指示器 */}
            <div
              className="absolute top-0 bottom-0 w-1/2 bg-accent/[0.07] border border-accent/25 rounded-full transition-all duration-300 ease-in-out"
              style={{ left: activeTab === 'cantonese' ? '0' : '50%' }}
            />
            <button
              onClick={() => setActiveTab('cantonese')}
              className={`relative z-10 flex-1 flex flex-col items-center py-2.5 rounded-full transition-colors duration-300 ${
                activeTab === 'cantonese'
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <span className="text-sm font-medium tracking-wider">粵語原文</span>
              <span className="uppercase text-[9px] tracking-[0.15em] opacity-45 mt-0.5">
                Cantonese Original
              </span>
            </button>
            <button
              onClick={() => setActiveTab('mandarin')}
              className={`relative z-10 flex-1 flex flex-col items-center py-2.5 rounded-full transition-colors duration-300 ${
                activeTab === 'mandarin'
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <span className="text-sm font-medium tracking-wider">國語翻譯</span>
              <span className="uppercase text-[9px] tracking-[0.15em] opacity-45 mt-0.5">
                Mandarin Translation
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-border-gold/20" />

      {/* Transcript content */}
      <div>
        {activeTranscript === null ? (
          <p className="text-text-muted italic text-center py-12">文稿整理中，敬请期待</p>
        ) : typeof activeTranscript === 'string' ? (
          <div className="whitespace-pre-wrap text-base text-text-primary leading-relaxed">
            {activeTranscript}
          </div>
        ) : (
          <SegmentList
            segments={activeTranscript.segments}
            currentTime={currentTime}
            onTimestampClick={onTimestampClick}
          />
        )}
      </div>
    </div>
  );
}
