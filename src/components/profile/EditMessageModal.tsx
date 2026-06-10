'use client';

import { useState } from 'react';

interface EditMessageData {
  id: string;
  content: string;
  tab: string;
  storyTags: string[];
  relatedYear: number | null;
}

interface EditMessageModalProps {
  message: EditMessageData;
  onClose: () => void;
  onSave: () => void;
}

const STORY_TAG_OPTIONS = ['追星经历', '影视回忆', '音乐记忆', '冷知识', '其他'];

export function EditMessageModal({ message, onClose, onSave }: EditMessageModalProps) {
  const [content, setContent] = useState(message.content);
  const [storyTags, setStoryTags] = useState<string[]>(message.storyTags);
  const [relatedYear, setRelatedYear] = useState(
    message.relatedYear != null ? String(message.relatedYear) : '',
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function toggleTag(tag: string) {
    setStoryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSave() {
    const trimmed = content.trim();
    if (!trimmed) {
      setError('留言内容不能为空');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('user_token');
      const body: Record<string, unknown> = { content: trimmed };

      if (message.tab === 'story') {
        body.storyTags = storyTags;
        body.relatedYear = relatedYear ? Number(relatedYear) : null;
      }

      const res = await fetch(`/api/user/messages/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || '保存失败');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 glass bg-black/60" onClick={onClose} />

      {/* 弹窗 */}
      <div className="relative z-10 w-full max-w-lg rounded-[var(--radius-card)] border border-border-gold bg-bg-darker p-6">
        <h3 className="mb-4 font-heading text-lg font-semibold text-accent">编辑留言</h3>

        {/* 内容 */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-border-gold bg-bg-dark/50 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
          placeholder="请输入留言内容..."
        />

        {/* 故事 tab 额外字段 */}
        {message.tab === 'story' && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-2 block text-xs text-text-secondary">故事标签</label>
              <div className="flex flex-wrap gap-2">
                {STORY_TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1 text-xs transition-all ${
                      storyTags.includes(tag)
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-border-gold text-text-secondary hover:border-accent/60 hover:text-accent'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-text-secondary">相关年份</label>
              <input
                type="number"
                value={relatedYear}
                onChange={(e) => setRelatedYear(e.target.value)}
                placeholder="例如 2003"
                className="w-32 rounded-lg border border-border-gold bg-bg-dark/50 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        {/* 按钮 */}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-border-gold px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg-dark transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
