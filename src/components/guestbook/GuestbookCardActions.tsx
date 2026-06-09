'use client';

import { useState } from 'react';
import { EditMessageModal } from '@/components/profile/EditMessageModal';

interface GuestbookCardActionsProps {
  messageId: string;
  message: {
    id: string;
    content: string;
    tab: string;
    storyTags: string[];
    relatedYear: number | null;
  };
}

export function GuestbookCardActions({ message }: GuestbookCardActionsProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setShowEdit(true);
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();

    if (!window.confirm('确定要删除这条留言吗？')) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch(`/api/user/messages/${message.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error?.message || '删除失败');
        return;
      }

      window.location.reload();
    } catch {
      alert('删除失败，请稍后重试');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <span className="flex items-center gap-2 ml-auto">
        <button
          onClick={handleEdit}
          className="text-xs text-text-muted hover:text-accent transition-colors"
        >
          编辑
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {deleting ? '删除中...' : '删除'}
        </button>
      </span>

      {showEdit && (
        <EditMessageModal
          message={message}
          onClose={() => setShowEdit(false)}
          onSave={() => {
            setShowEdit(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
