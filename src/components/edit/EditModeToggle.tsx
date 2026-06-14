'use client';

import { cn } from '@/lib/cn';
import { useEditMode } from './EditModeProvider';

export function EditModeToggle() {
  const { canShowEditButton, editMode, toggleEditMode } = useEditMode();

  if (!canShowEditButton) return null;

  return (
    <button
      onClick={toggleEditMode}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs tracking-wide transition-all duration-200',
        editMode
          ? 'bg-accent/20 text-accent border border-accent/40 shadow-[0_0_8px_rgba(var(--accent-rgb),0.15)]'
          : 'text-text-muted hover:text-accent border border-transparent hover:border-accent/20',
      )}
      aria-label={editMode ? '关闭编辑模式' : '开启编辑模式'}
      title={editMode ? '关闭编辑模式' : '开启编辑模式'}
    >
      {/* Pencil icon */}
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
      {editMode && <span>编辑中</span>}
    </button>
  );
}
