'use client';

import { useRef, useState, useEffect, useCallback, forwardRef } from 'react';

interface AudioPlayerProps {
  src: string;
  duration?: string;
  onExternalTimeUpdate?: (time: number) => void;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const PlayIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

const RewindIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontSize="7"
      fontWeight="bold"
    >
      15
    </text>
  </svg>
);

const ForwardIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5V1l5 5-5 5V7a6 6 0 1 0 6 6" />
    <text
      x="12"
      y="16"
      textAnchor="middle"
      fill="currentColor"
      stroke="none"
      fontSize="7"
      fontWeight="bold"
    >
      15
    </text>
  </svg>
);

const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2];

// Fixed waveform bars (0-1 range, ~70 bars, bell-curve-ish with natural variation)
const WAVEFORM_BARS = [
  0.18, 0.25, 0.22, 0.3, 0.35, 0.28, 0.4, 0.45, 0.38, 0.5, 0.42, 0.55, 0.48, 0.6, 0.52, 0.65, 0.7,
  0.58, 0.75, 0.68, 0.8, 0.72, 0.85, 0.78, 0.9, 0.82, 0.88, 0.95, 0.85, 0.92, 0.98, 0.9, 1.0, 0.95,
  0.88, 0.92, 0.85, 0.98, 0.9, 0.82, 0.95, 0.88, 0.8, 0.85, 0.75, 0.82, 0.7, 0.78, 0.65, 0.72, 0.6,
  0.68, 0.55, 0.62, 0.5, 0.58, 0.45, 0.52, 0.4, 0.48, 0.35, 0.42, 0.3, 0.38, 0.25, 0.32, 0.2, 0.28,
  0.22, 0.18,
];

const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(function AudioPlayer(
  { src, duration, onExternalTimeUpdate },
  forwardedRef,
) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // 合并外部 ref 和内部 audioRef
  const setAudioRef = useCallback(
    (node: HTMLAudioElement | null) => {
      (audioRef as React.MutableRefObject<HTMLAudioElement | null>).current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as React.MutableRefObject<HTMLAudioElement | null>).current = node;
      }
    },
    [forwardedRef],
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
        onExternalTimeUpdate?.(audio.currentTime);
      }
    };
    const onLoadedMetadata = () => setAudioDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [isDragging, onExternalTimeUpdate]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + seconds));
  }, []);

  const changeRate = useCallback((rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const seekToPosition = useCallback((clientX: number) => {
    const bar = progressRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || !isFinite(audio.duration)) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setCurrentTime(audio.currentTime);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      seekToPosition(e.clientX);

      const onMouseMove = (ev: MouseEvent) => seekToPosition(ev.clientX);
      const onMouseUp = (ev: MouseEvent) => {
        seekToPosition(ev.clientX);
        setIsDragging(false);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    },
    [seekToPosition],
  );

  const totalDuration = audioDuration > 0 ? audioDuration : 0;
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;
  const displayDuration = duration || formatTime(totalDuration);

  return (
    <div className="space-y-5">
      <audio ref={setAudioRef} src={src} preload="metadata" />

      {/* Current Playback Label + Time */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted uppercase tracking-wider">
          当前播放 <span className="ml-1">Current Playback</span>
        </p>
        <p className="text-sm text-text-secondary font-mono">
          {formatTime(currentTime)} / {displayDuration}
        </p>
      </div>

      {/* Waveform + Progress */}
      <div
        ref={progressRef}
        className="relative cursor-pointer group select-none"
        onMouseDown={handleMouseDown}
      >
        {/* Waveform bars */}
        <div className="flex items-end justify-between h-12 gap-[2px]">
          {WAVEFORM_BARS.map((height, i) => {
            const barPercent = ((i + 0.5) / WAVEFORM_BARS.length) * 100;
            const isPlayed = barPercent <= progress;
            return (
              <div
                key={i}
                className={`flex-1 min-w-[2px] max-w-[4px] rounded-sm transition-colors duration-150 ${
                  isPlayed ? 'bg-accent' : 'bg-white/10'
                }`}
                style={{ height: `${Math.max(4, height * 40)}px` }}
              />
            );
          })}
        </div>
        {/* Thin progress line underneath */}
        <div className="relative h-0.5 bg-white/5 mt-1 rounded-full">
          <div
            className="absolute top-0 left-0 h-full bg-accent rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Rewind 15s */}
        <button
          type="button"
          onClick={() => skip(-15)}
          className="w-10 h-10 rounded-full border border-border-gold flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
          aria-label="后退15秒"
        >
          <RewindIcon />
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-14 h-14 rounded-full border-2 border-accent flex items-center justify-center text-accent hover:bg-accent/10 transition-colors"
          aria-label={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        {/* Forward 15s */}
        <button
          type="button"
          onClick={() => skip(15)}
          className="w-10 h-10 rounded-full border border-border-gold flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
          aria-label="前进15秒"
        >
          <ForwardIcon />
        </button>
      </div>

      {/* Playback Speed */}
      <div className="space-y-2">
        <p className="text-xs text-text-muted uppercase tracking-wider">
          播放速度 <span className="ml-1">Playback Speed</span>
        </p>
        <div className="flex items-center gap-2">
          {PLAYBACK_RATES.map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => changeRate(rate)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                playbackRate === rate
                  ? 'bg-accent/20 border border-accent text-accent'
                  : 'border border-white/10 text-text-secondary hover:border-border-gold hover:text-text-primary'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default AudioPlayer;
