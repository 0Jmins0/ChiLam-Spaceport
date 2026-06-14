'use client';

import { useEditMode } from './EditModeProvider';

export function EditStatusBar() {
  const { editMode, toggleEditMode } = useEditMode();

  if (!editMode) return null;

  return (
    <div
      className="fixed left-0 right-0 z-50 flex items-center justify-center gap-4 bg-accent px-4 py-1.5 text-sm font-medium text-bg-darker"
      style={{ top: '64px' }}
    >
      <span className="tracking-wide">编辑模式已开启 — 点击内容区域进行编辑</span>
      <button
        onClick={toggleEditMode}
        className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-bg-darker/80 transition-colors hover:bg-bg-darker/10 hover:text-bg-darker"
        aria-label="关闭编辑模式"
      >
        {/* Close icon */}
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        关闭
      </button>
    </div>
  );
}
