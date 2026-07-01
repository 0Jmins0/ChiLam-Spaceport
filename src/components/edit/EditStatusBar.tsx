'use client';

import { useEditMode } from './EditModeProvider';

export function EditStatusBar() {
  const {
    editMode,
    hasChanges,
    pendingOperations,
    saveStatus,
    uploadStatus,
    errorMessage,
    saveChanges,
    discardChanges,
  } = useEditMode();

  if (!editMode) return null;

  const isSaving = saveStatus === 'saving';
  const isUploading = uploadStatus === 'uploading';
  const isSaveDisabled = isSaving || isUploading || !hasChanges;
  const statusLabel = isSaving
    ? '保存中...'
    : isUploading
      ? '上传中...'
      : saveStatus === 'error' || uploadStatus === 'error'
        ? errorMessage || '操作失败'
        : saveStatus === 'saved'
          ? '已保存'
          : hasChanges
            ? '有未保存修改'
            : '编辑模式已开启';

  return (
    <div
      className="fixed left-0 right-0 z-50 flex items-center justify-center gap-3 bg-accent px-4 py-1.5 text-sm font-medium text-bg-darker shadow-md"
      style={{ top: '64px' }}
    >
      <span className="tracking-wide">{statusLabel}</span>
      <span className="rounded bg-bg-darker/10 px-2 py-0.5 text-xs">
        待保存 {pendingOperations.length}
      </span>
      <button
        onClick={() => void saveChanges()}
        disabled={isSaveDisabled}
        className="rounded bg-bg-darker px-2.5 py-0.5 text-xs text-accent transition-colors hover:bg-bg-darker/90 disabled:cursor-not-allowed disabled:bg-bg-darker/30 disabled:text-bg-darker/50"
      >
        保存
      </button>
      <button
        onClick={() => void discardChanges()}
        disabled={isSaving}
        className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-bg-darker/80 transition-colors hover:bg-bg-darker/10 hover:text-bg-darker disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="退出编辑模式"
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
        退出
      </button>
    </div>
  );
}
