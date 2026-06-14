'use client';

import { useState } from 'react';
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

function SpeakerBadge({ speaker }: { speaker: string }) {
  const letter = speaker.charAt(0).toUpperCase();

  let colorClasses: string;
  switch (letter) {
    case 'J':
      colorClasses = 'bg-accent/20 text-accent border border-accent/40';
      break;
    case 'H':
      colorClasses = 'bg-white/10 text-text-secondary border border-white/20';
      break;
    default:
      colorClasses = 'bg-white/5 text-text-muted border border-white/10';
      break;
  }

  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold ${colorClasses}`}
    >
      {letter}
    </div>
  );
}

function SegmentList({ segments }: { segments: TranscriptSegment[] }) {
  return (
    <div className="relative space-y-6 pl-14">
      {/* Timeline vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-accent/20" />

      {segments.map((seg, i) => (
        <div key={i} className="relative">
          {/* Speaker badge positioned on the timeline */}
          <div className="absolute -left-14 top-0">
            <SpeakerBadge speaker={seg.speaker} />
          </div>

          {/* Content */}
          <div className="pt-1">
            {seg.speakerLabel && (
              <p className="text-xs text-accent/70 font-medium mb-1 uppercase tracking-wide">
                {seg.speakerLabel}
              </p>
            )}
            <p className="text-base text-text-primary leading-relaxed">{seg.text}</p>
            {seg.timestamp && <p className="text-xs text-text-muted mt-1">{seg.timestamp}</p>}
          </div>
        </div>
      ))}
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
      {/* Language toggle */}
      {hasBoth && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-border-gold bg-bg-darker p-1">
            <button
              onClick={() => setActiveTab('cantonese')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'cantonese'
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <span className="hidden sm:inline">粤语原文 </span>
              <span className="sm:hidden">粤语 </span>
              <span className="uppercase text-[10px] sm:text-xs tracking-wider opacity-70">
                Cantonese <span className="hidden sm:inline">Original</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('mandarin')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'mandarin'
                  ? 'bg-accent/20 text-accent'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <span className="hidden sm:inline">国语翻译 </span>
              <span className="sm:hidden">国语 </span>
              <span className="uppercase text-[10px] sm:text-xs tracking-wider opacity-70">
                Mandarin <span className="hidden sm:inline">Translation</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Title area */}
      <div className="space-y-3">
        <EditableText
          value={title}
          entityType="interview"
          entityId={interviewId}
          field="title"
          className="font-heading text-2xl md:text-3xl lg:text-4xl text-text-primary font-semibold"
          placeholder="标题..."
        >
          <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl text-text-primary font-semibold">
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
          {titleEn ? <span className="text-base text-text-secondary italic mt-2">{titleEn}</span> : null}
        </EditableText>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-text-muted">{formatDate(date)}</span>
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
          <span className="text-text-muted/30">|</span>
          <span className="text-xs text-text-muted uppercase tracking-wider">Excerpt</span>
        </div>
      </div>

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
          <SegmentList segments={activeTranscript.segments} />
        )}
      </div>
    </div>
  );
}
