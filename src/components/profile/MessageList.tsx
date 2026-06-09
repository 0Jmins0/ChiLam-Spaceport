'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { EditMessageModal } from './EditMessageModal';

const TAB_LABELS: Record<string, string> = {
  message: '我想对你说',
  story: '故事分享',
  feedback: '建议反馈',
};

interface MessageItem {
  id: string;
  content: string;
  tab: string;
  storyTags: string[];
  relatedYear: number | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
}

export function MessageList() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingMessage, setEditingMessage] = useState<MessageItem | null>(null);

  const fetchMessages = useCallback(async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch(`/api/user/messages?page=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || '获取留言失败');
      }
      const json = await res.json();
      setMessages(json.data);
      setPagination(json.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取留言失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wrap in microtask to avoid synchronous setState in effect body
    Promise.resolve().then(() => fetchMessages(page));
  }, [page, fetchMessages]);

  async function handleDelete(id: string) {
    if (!window.confirm('确定要删除这条留言吗？删除后无法恢复。')) return;

    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch(`/api/user/messages/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || '删除失败');
      }
      fetchMessages(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  }

  function handleEditSave() {
    setEditingMessage(null);
    fetchMessages(page);
  }

  // 加载中
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  // 错误
  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => fetchMessages(page)}
          className="mt-3 text-sm text-accent hover:underline"
        >
          重试
        </button>
      </div>
    );
  }

  // 空状态
  if (messages.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-text-muted">暂无留言</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {messages.map((msg) => {
          const dateStr = new Date(msg.createdAt).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          const truncated =
            msg.content.length > 200 ? msg.content.slice(0, 200) + '...' : msg.content;

          return (
            <Card key={msg.id} className="flex flex-col gap-3 p-4">
              {/* 顶部：标签 + 日期 */}
              <div className="flex items-center justify-between">
                <Tag active>{TAB_LABELS[msg.tab] ?? msg.tab}</Tag>
                <span className="text-xs text-text-muted">{dateStr}</span>
              </div>

              {/* 内容 */}
              <p className="text-sm leading-relaxed text-text-secondary">{truncated}</p>

              {/* 底部：统计 + 操作 */}
              <div className="flex items-center justify-between border-t border-border-gold/30 pt-2">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <HeartIcon />
                    {msg.likesCount}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-muted">
                    <CommentIcon />
                    {msg.commentsCount}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingMessage(msg)}
                    className="rounded-md px-3 py-1 text-xs text-accent transition-colors hover:bg-accent/10"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="rounded-md px-3 py-1 text-xs text-red-400 transition-colors hover:bg-red-400/10"
                  >
                    删除
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 分页 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-border-gold px-4 py-2 text-sm text-text-secondary transition-colors hover:text-accent disabled:opacity-40"
          >
            上一页
          </button>
          <span className="text-sm text-text-muted">
            {pagination.currentPage} / {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasMore}
            className="rounded-lg border border-border-gold px-4 py-2 text-sm text-text-secondary transition-colors hover:text-accent disabled:opacity-40"
          >
            下一页
          </button>
        </div>
      )}

      {/* 编辑弹窗 */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage}
          onClose={() => setEditingMessage(null)}
          onSave={handleEditSave}
        />
      )}
    </>
  );
}

function HeartIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}
