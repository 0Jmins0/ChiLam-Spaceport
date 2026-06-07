'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import type { MessageTab } from '@/lib/types';

const storyTagOptions = ['追星经历', '影视回忆', '音乐记忆', '冷知识', '其他'];

export function GuestbookForm() {
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as MessageTab) || 'message';

  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [storyTags, setStoryTags] = useState<string[]>([]);
  const [relatedYear, setRelatedYear] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleStoryTagToggle = (tag: string) => {
    setStoryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const body: Record<string, unknown> = {
        nickname: nickname.trim(),
        content: content.trim(),
        tab: currentTab,
      };

      if (currentTab === 'story') {
        if (storyTags.length > 0) body.storyTags = storyTags;
        if (relatedYear) body.relatedYear = Number(relatedYear);
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage('留言已提交成功');
        setNickname('');
        setContent('');
        setStoryTags([]);
        setRelatedYear('');
      } else {
        const data = await res.json();
        setMessage(data.error?.message || '提交失败，请稍后重试');
      }
    } catch {
      setMessage('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 p-5 space-y-4"
    >
      <h3 className="font-heading text-base text-text-primary">发表留言</h3>

      {/* 昵称 */}
      <div>
        <label className="block text-xs text-text-muted mb-1">昵称 *</label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={30}
          required
          className="w-full rounded-md border border-border-gold/50 bg-bg-darker px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none"
          placeholder="你的昵称"
        />
      </div>

      {/* 内容 */}
      <div>
        <label className="block text-xs text-text-muted mb-1">内容 *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={2000}
          required
          rows={4}
          className="w-full rounded-md border border-border-gold/50 bg-bg-darker px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:border-accent focus:outline-none resize-none"
          placeholder="想说的话..."
        />
      </div>

      {/* 故事 tab 额外字段 */}
      {currentTab === 'story' && (
        <>
          <div>
            <label className="block text-xs text-text-muted mb-2">故事标签</label>
            <div className="flex flex-wrap gap-2">
              {storyTagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleStoryTagToggle(tag)}
                  className={`rounded-full px-3 py-1 text-xs border transition-colors ${
                    storyTags.includes(tag)
                      ? 'border-accent bg-accent/20 text-accent'
                      : 'border-border-gold/50 text-text-muted hover:border-accent/50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-text-muted mb-1">相关年份（可选）</label>
            <input
              type="number"
              value={relatedYear}
              onChange={(e) => setRelatedYear(e.target.value)}
              min={1970}
              max={new Date().getFullYear()}
              className="w-32 rounded-md border border-border-gold/50 bg-bg-darker px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              placeholder="如 2005"
            />
          </div>
        </>
      )}

      {/* 提交 */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? '提交中...' : '发表'}
        </Button>
        {message && <span className="text-xs text-accent">{message}</span>}
      </div>
    </form>
  );
}
