'use client';

import { cn } from '@/lib/cn';
import { useEditMode } from '@/components/edit/EditModeProvider';

interface CreateEntryButtonProps {
  onClick: () => void;
  label?: string;
}

export function CreateEntryButton({ onClick, label = '新增' }: CreateEntryButtonProps) {
  const { editMode } = useEditMode();

  if (!editMode) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-[var(--radius-card)] px-4 py-2.5',
        'border border-dashed border-accent/50 bg-accent/5',
        'text-sm text-accent tracking-wide',
        'transition-all duration-200',
        'hover:border-solid hover:border-accent hover:bg-accent/10 hover:scale-[1.02]',
        'active:scale-[0.98]',
      )}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
