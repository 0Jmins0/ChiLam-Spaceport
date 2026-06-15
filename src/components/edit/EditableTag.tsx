'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { useEditMode } from './EditModeProvider';

interface EditableTagProps {
  tags: { name: string; slug: string }[];
  entityType: string;
  entityId: string;
  children: ReactNode;
}

export function EditableTag({
  tags,
  entityType: _entityType,
  entityId: _entityId,
  children,
}: EditableTagProps) {
  const { editMode } = useEditMode();
  const [localTags, setLocalTags] = useState(tags);
  const [adding, setAdding] = useState(false);
  const [newTag, setNewTag] = useState('');

  if (!editMode) {
    return <>{children}</>;
  }

  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;

    // Generate slug from name
    const slug = trimmed
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u4e00-\u9fff-]/g, '');

    // Prevent duplicates
    if (localTags.some((t) => t.slug === slug || t.name === trimmed)) {
      setNewTag('');
      setAdding(false);
      return;
    }

    setLocalTags((prev) => [...prev, { name: trimmed, slug }]);
    setNewTag('');
    setAdding(false);

    // TODO: Wire to API using _entityType, _entityId
  };

  const handleRemoveTag = (slug: string) => {
    setLocalTags((prev) => prev.filter((t) => t.slug !== slug));

    // TODO: Wire to API using _entityType, _entityId
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
    if (e.key === 'Escape') {
      setAdding(false);
      setNewTag('');
    }
  };

  return (
    <div className="group/editable-tags">
      <div className="flex flex-wrap items-center gap-2">
        {localTags.map((tag) => (
          <span
            key={tag.slug}
            className="inline-flex items-center gap-1 rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 text-xs text-accent"
          >
            {tag.name}
            <button
              onClick={() => handleRemoveTag(tag.slug)}
              className="ml-0.5 text-accent/40 transition-colors hover:text-red-400"
              aria-label={`删除标签 ${tag.name}`}
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}

        {/* Add tag button / input */}
        {adding ? (
          <div className="inline-flex items-center gap-1">
            <input
              autoFocus
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTag.trim()) setAdding(false);
              }}
              placeholder="标签名"
              className="w-24 rounded border border-accent/30 bg-bg-darker px-2 py-0.5 text-xs text-text-primary outline-none focus:border-accent"
            />
            <button
              onClick={handleAddTag}
              className="text-xs text-accent transition-colors hover:text-accent/80"
            >
              添加
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full border border-dashed border-accent/20 px-2 py-0.5 text-xs text-text-muted transition-all duration-200',
              'hover:border-accent/40 hover:text-accent',
            )}
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            添加标签
          </button>
        )}
      </div>
    </div>
  );
}
