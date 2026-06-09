'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import type { CommentItem } from '@/lib/types';

interface CommentSectionProps {
  targetId: string;
  initialComments: CommentItem[];
  totalCount: number;
}

export function CommentSection({ targetId, initialComments, totalCount }: CommentSectionProps) {
  const { user, openLogin } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [total, setTotal] = useState(totalCount);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    if (content.length > 300) {
      setError('评论内容不能超过300字');
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) {
      openLogin();
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/messages/${targetId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [...prev, data.data]);
        setTotal((prev) => prev + 1);
        setContent('');
      } else {
        const data = await res.json();
        setError(data.error?.message || '提交失败');
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-base text-text-primary">评论 ({total})</h3>

      {/* 评论列表 */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-md border border-border-gold/30 bg-bg-darker/50 p-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-accent">{comment.nickname}</span>
                <span className="text-xs text-text-muted">
                  {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className="text-sm text-text-secondary">{comment.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-text-muted">暂无评论，来说两句吧</p>
      )}

      {/* 评论表单 */}
      {user ? (
        <form onSubmit={handleSubmit} className="space-y-3 pt-3 border-t border-border-gold/30">
          <div className="flex gap-3">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={300}
              required
              className="flex-1 rounded-md border border-border-gold/50 bg-bg-darker px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
              placeholder={`以 ${user.displayName || user.username} 的身份评论...`}
            />
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? '...' : '发送'}
            </Button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
      ) : (
        <div className="pt-3 border-t border-border-gold/30 text-center">
          <button onClick={openLogin} className="text-sm text-accent hover:underline">
            登录后即可评论
          </button>
        </div>
      )}
    </div>
  );
}
