'use client';

import { useMemo } from 'react';
import { useEditMode } from './EditModeProvider';

interface DeleteEntryButtonProps {
  entityType: string;
  entityId: string;
  label?: string;
}

export function DeleteEntryButton({
  entityType,
  entityId,
  label = '删除此条目',
}: DeleteEntryButtonProps) {
  const { editMode, pendingOperations, registerEntryDelete } = useEditMode();
  const marked = useMemo(
    () =>
      pendingOperations.some(
        (operation) =>
          operation.type === 'entry_delete' &&
          operation.entityType === entityType &&
          operation.entityId === entityId,
      ),
    [entityId, entityType, pendingOperations],
  );

  if (!editMode) return null;

  const handleClick = () => {
    if (marked) return;
    if (!confirm('确定删除此条目？保存后将从数据库删除，并清理不再被引用的媒体。')) return;

    registerEntryDelete({ entityType, entityId });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={marked}
      className="rounded-md border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-red-500/20 disabled:text-red-300/60"
    >
      {marked ? '已标记删除' : label}
    </button>
  );
}
