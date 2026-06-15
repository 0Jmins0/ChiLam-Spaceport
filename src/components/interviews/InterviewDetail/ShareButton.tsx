'use client';

import { useState, useCallback } from 'react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = window.location.href;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-accent text-accent hover:bg-accent/10 transition-colors"
    >
      {copied ? (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-medium">已复制</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Copied</span>
          </span>
        </>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-sm font-medium">分享此頁</span>
            <span className="text-[10px] uppercase tracking-wider opacity-70">Share</span>
          </span>
        </>
      )}
    </button>
  );
}
