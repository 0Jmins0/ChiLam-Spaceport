'use client';

import { useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { ImageUploader, type ImageUploaderRef } from '@/components/guestbook/ImageUploader';
import { useAuth } from '@/components/auth/AuthProvider';
import type { ImageCropData, MessageTab } from '@/lib/types';

const storyTagOptions = ['追星经历', '影视回忆', '音乐记忆', '冷知识', '其他'];

export function GuestbookForm() {
  const searchParams = useSearchParams();
  const currentTab = (searchParams.get('tab') as MessageTab) || 'message';
  const router = useRouter();
  const { user, openLogin } = useAuth();

  const imageUploaderRef = useRef<ImageUploaderRef>(null);
  const [content, setContent] = useState('');
  const [storyTags, setStoryTags] = useState<string[]>([]);
  const [relatedYear, setRelatedYear] = useState('');
  const [imageData, setImageData] = useState<{
    mediaId: string;
    url: string;
    cropData: ImageCropData | null;
  } | null>(null);
  const [imageAsBackground, setImageAsBackground] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleStoryTagToggle = (tag: string) => {
    setStoryTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const token = localStorage.getItem('user_token');
    if (!token) {
      openLogin();
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const body: Record<string, unknown> = {
        content: content.trim(),
        tab: currentTab,
      };

      if (currentTab === 'story') {
        if (storyTags.length > 0) body.storyTags = storyTags;
        if (relatedYear) body.relatedYear = Number(relatedYear);
      }

      if (imageData) {
        body.imageId = imageData.mediaId;
        if (imageData.cropData) body.imageCropData = imageData.cropData;
        body.imageAsBackground = imageAsBackground;
      }

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage('留言已发布');
        setContent('');
        setStoryTags([]);
        setRelatedYear('');
        setImageData(null);
        setImageAsBackground(false);
        imageUploaderRef.current?.reset();
        router.refresh();
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

  // 未登录提示
  if (!user) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 p-5 text-center space-y-3">
        <p className="text-sm text-text-secondary">登录后即可发表留言</p>
        <Button size="sm" onClick={openLogin}>
          登录 / 注册
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-base text-text-primary">发表留言</h3>
        <span className="text-xs text-text-muted">
          以 <span className="text-accent">{user.displayName || user.username}</span> 的身份发言
        </span>
      </div>

      {/* 内容 */}
      <div>
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

      {/* 图片上传 */}
      <div className="space-y-2">
        <ImageUploader
          ref={imageUploaderRef}
          onImageUploaded={(data) => setImageData(data)}
          onImageRemoved={() => {
            setImageData(null);
            setImageAsBackground(false);
          }}
        />
        {/* 融合显示选项暂时关闭，后续开启 */}
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
          {submitting ? '发布中...' : '发表'}
        </Button>
        {message && <span className="text-xs text-accent">{message}</span>}
      </div>
    </form>
  );
}
