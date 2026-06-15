'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { GalleryItem } from '@/lib/types';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCollectionModal({ isOpen, onClose }: CreateCollectionModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [mediaItems, setMediaItems] = useState<GalleryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 加载媒体列表
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/gallery?pageSize=50')
      .then((res) => res.json())
      .then((data) => setMediaItems(data.data || []))
      .catch(() => {});
  }, [isOpen]);

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch('/api/gallery/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          date: date || null,
          mediaIds: Array.from(selectedIds),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '创建失败');
      }

      router.refresh();
      onClose();
      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setSelectedIds(new Set());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-white/10 bg-[#1A1A2E] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <h2 className="mb-4 text-lg font-semibold text-white">新建相册集</h2>

        {/* 表单 */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-white/60">标题 *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：2024忘不了宣传活动"
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="可选描述..."
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-500/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-white/60">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-amber-500/50"
            />
          </div>
        </div>

        {/* 媒体选择 */}
        <div className="mt-6">
          <p className="mb-2 text-sm text-white/60">选择媒体（已选 {selectedIds.size} 项）</p>
          <div className="grid max-h-60 grid-cols-5 gap-2 overflow-y-auto rounded border border-white/5 bg-white/[0.02] p-2">
            {mediaItems.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleSelect(item.id)}
                className={`relative aspect-square overflow-hidden rounded transition-all ${
                  selectedIds.has(item.id)
                    ? 'ring-2 ring-amber-500'
                    : 'ring-1 ring-white/10 hover:ring-white/30'
                }`}
              >
                <Image
                  src={item.thumbnailUrl || item.url}
                  alt={item.alt || ''}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
                {selectedIds.has(item.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-amber-500/20">
                    <svg
                      className="h-5 w-5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
            {mediaItems.length === 0 && (
              <p className="col-span-5 py-8 text-center text-sm text-white/30">暂无可选媒体</p>
            )}
          </div>
        </div>

        {/* 错误 */}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        {/* 按钮 */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded px-4 py-2 text-sm text-white/60 hover:text-white"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? '创建中...' : '创建相册集'}
          </button>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
