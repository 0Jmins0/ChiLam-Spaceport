'use client';

import { useState, useRef, useEffect, type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/cn';
import { useEditMode } from './EditModeProvider';

interface EditableTextProps {
  value: string | null | undefined;
  entityType: string;
  entityId: string;
  field: string;
  as?: 'h1' | 'h2' | 'p' | 'span' | 'div';
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  children: ReactNode;
}

type SaveStatus = 'idle' | 'saved' | 'error';

export function EditableText({
  value,
  entityType,
  entityId,
  field,
  as: Tag = 'span',
  multiline = false,
  className,
  placeholder = '点击输入...',
  children,
}: EditableTextProps) {
  const { editMode, registerFieldChange } = useEditMode();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [displayValue, setDisplayValue] = useState(value ?? '');
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Focus input when entering edit state
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [editing]);

  if (!editMode) {
    return <>{children}</>;
  }

  const handleStartEdit = () => {
    const currentValue = value ?? '';
    setDisplayValue(currentValue);
    setDraft(currentValue);
    setEditing(true);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleSave = () => {
    if (draft === displayValue) {
      setEditing(false);
      return;
    }

    try {
      registerFieldChange({
        entityType,
        entityId,
        field,
        value: draft,
      });
      setDisplayValue(draft);
      setStatus('saved');
      setEditing(false);
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : '暂存失败');
    }
  };

  const handleCancel = () => {
    setDraft(displayValue);
    setEditing(false);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Editing state: show input/textarea
  if (editing) {
    const InputTag = multiline ? 'textarea' : 'input';

    return (
      <div className="relative">
        <InputTag
          ref={inputRef as React.Ref<HTMLInputElement & HTMLTextAreaElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={multiline ? undefined : handleSave}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md border border-accent/50 bg-bg-darker px-3 py-2 text-text-primary outline-none transition-colors',
            'focus:border-accent focus:ring-1 focus:ring-accent/30',
            multiline && 'min-h-[120px] resize-y',
            className,
          )}
          rows={multiline ? 5 : undefined}
        />
        {multiline && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={handleSave}
              className="rounded bg-accent/90 px-3 py-1 text-xs font-medium text-bg-darker transition-colors hover:bg-accent disabled:opacity-50"
            >
              暂存
            </button>
            <button
              onClick={handleCancel}
              className="rounded px-3 py-1 text-xs text-text-muted transition-colors hover:text-text-secondary"
            >
              取消
            </button>
          </div>
        )}
        {status === 'error' && <p className="mt-1 text-xs text-red-400">{errorMsg}</p>}
      </div>
    );
  }

  // Non-editing state in edit mode: show content with hover indicators
  const Wrapper = Tag as ElementType;

  return (
    <div className="group/editable relative inline-block w-full">
      <Wrapper
        onClick={handleStartEdit}
        className={cn(
          'cursor-pointer rounded-sm transition-all duration-200',
          'outline outline-1 outline-transparent group-hover/editable:outline-accent/30 group-hover/editable:outline-dashed',
          !displayValue && 'italic text-text-muted',
          className,
        )}
      >
        {displayValue ? children : placeholder}
      </Wrapper>

      {/* Pencil icon on hover */}
      <span className="pointer-events-none absolute -right-5 top-0 text-accent/0 transition-all duration-200 group-hover/editable:text-accent/60">
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
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
          />
        </svg>
      </span>

      {/* Status indicators */}
      {status === 'saved' && (
        <span className="absolute -right-5 top-0 text-green-400 text-xs">&#10003;</span>
      )}
      {status === 'error' && (
        <span className="absolute -right-5 top-0 text-red-400 text-xs" title={errorMsg}>
          !
        </span>
      )}
    </div>
  );
}
