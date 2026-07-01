'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useEditMode } from '@/components/edit/EditModeProvider';

interface CreateEntryModalProps {
  open: boolean;
  onClose: () => void;
  entityType: string;
  defaultValues?: Record<string, string>;
}

// --- Constants ---

const ENTITY_LABELS: Record<string, string> = {
  production: '影视作品',
  performance: '演出',
  endorsement: '代言',
  interview: '访谈',
  livestream: '直播',
  album: '专辑',
  magazine: '杂志',
  socialPost: '社交动态',
  newsArticle: '新闻',
  sighting: '路透',
};

const API_ROUTES: Record<string, string> = {
  production: '/api/screens',
  performance: '/api/performances',
  endorsement: '/api/activities/endorsements',
  interview: '/api/interviews',
  livestream: '/api/activities/livestreams',
  album: '/api/archives/albums',
  magazine: '/api/archives/magazines',
  socialPost: '/api/updates/social',
  newsArticle: '/api/updates/news',
  sighting: '/api/updates/sightings',
};

const DETAIL_ROUTES: Record<string, (slug: string) => string> = {
  production: (slug) => `/screens/${slug}`,
  performance: (slug) => `/performances/${slug}`,
  endorsement: (slug) => `/activities/endorsements/${slug}`,
  interview: (slug) => `/interviews/${slug}`,
  livestream: (slug) => `/activities/livestreams/${slug}`,
  album: (slug) => `/archives/albums/${slug}`,
  magazine: (slug) => `/archives/magazines/${slug}`,
  socialPost: (id) => `/updates/social/${id}`,
  newsArticle: (slug) => `/updates/news/${slug}`,
  sighting: (slug) => `/updates/sightings/${slug}`,
};

const TYPE_OPTIONS: Record<string, { value: string; label: string }[]> = {
  production: [
    { value: 'MOVIE', label: '电影' },
    { value: 'TV_SERIES', label: '电视剧' },
    { value: 'VARIETY_SHOW', label: '综艺' },
  ],
  performance: [
    { value: 'CONCERT', label: '演唱会' },
    { value: 'STAGE', label: '舞台' },
    { value: 'MUSICAL', label: '音乐剧' },
  ],
  interview: [
    { value: 'VIDEO', label: '视频' },
    { value: 'AUDIO', label: '音频' },
    { value: 'TEXT', label: '图文' },
  ],
  livestream: [
    { value: 'WEIBO', label: '微博' },
    { value: 'DOUYIN', label: '抖音' },
    { value: 'INSTAGRAM', label: 'Instagram' },
    { value: 'YOUTUBE', label: 'YouTube' },
    { value: 'OTHER', label: '其他' },
  ],
  socialPost: [
    { value: 'weibo', label: '微博' },
    { value: 'xiaohongshu', label: '小红书' },
    { value: 'douyin', label: '抖音' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
  ],
};

// --- Field config types ---

interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

function getFieldConfigs(entityType: string): FieldConfig[] {
  const currentYear = new Date().getFullYear().toString();

  switch (entityType) {
    case 'production':
      return [
        { key: 'title', label: '标题', type: 'text', required: true },
        {
          key: 'type',
          label: '类型',
          type: 'select',
          required: true,
          options: TYPE_OPTIONS.production,
        },
        { key: 'year', label: '年份', type: 'number', required: true, defaultValue: currentYear },
        {
          key: 'roleType',
          label: '参与类型',
          type: 'select',
          required: false,
          options: [
            { label: '主演', value: '主演' },
            { label: '客串', value: '客串' },
            { label: '常驻', value: '常驻' },
            { label: '飞行', value: '飞行' },
          ],
        },
        { key: 'releaseDate', label: '上映/首播日期', type: 'date', required: false },
      ];
    case 'performance':
      return [
        { key: 'title', label: '标题', type: 'text', required: true },
        {
          key: 'type',
          label: '类型',
          type: 'select',
          required: true,
          options: TYPE_OPTIONS.performance,
        },
        { key: 'year', label: '年份', type: 'number', required: true, defaultValue: currentYear },
        { key: 'startDate', label: '演出日期', type: 'date', required: false },
      ];
    case 'endorsement':
      return [
        { key: 'brand', label: '品牌名称', type: 'text', required: true },
        {
          key: 'startYear',
          label: '起始年份',
          type: 'number',
          required: true,
          defaultValue: currentYear,
        },
        { key: 'startDate', label: '开始日期', type: 'date', required: false },
      ];
    case 'interview':
      return [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'date', label: '日期', type: 'date', required: true },
        {
          key: 'mediaType',
          label: '媒体类型',
          type: 'select',
          required: true,
          options: TYPE_OPTIONS.interview,
        },
      ];
    case 'livestream':
      return [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'date', label: '日期', type: 'date', required: true },
        {
          key: 'platform',
          label: '平台',
          type: 'select',
          required: true,
          options: TYPE_OPTIONS.livestream,
        },
      ];
    case 'album':
      return [
        { key: 'title', label: '标题', type: 'text', required: true },
        {
          key: 'releaseYear',
          label: '发行年份',
          type: 'number',
          required: true,
          defaultValue: currentYear,
        },
        { key: 'releaseDate', label: '发行日期', type: 'date', required: false },
      ];
    case 'magazine':
      return [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'date', label: '日期', type: 'date', required: true },
      ];
    case 'socialPost':
      return [
        {
          key: 'platform',
          label: '平台',
          type: 'select',
          required: true,
          options: TYPE_OPTIONS.socialPost,
        },
        { key: 'originalUrl', label: '原文链接', type: 'text', required: false },
        { key: 'publishedAt', label: '发布时间', type: 'date', required: false },
        { key: 'title', label: '标题', type: 'text', required: false },
      ];
    case 'newsArticle':
      return [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'originalUrl', label: '原文链接', type: 'text', required: false },
        { key: 'source', label: '来源', type: 'text', required: false },
        { key: 'publishedAt', label: '发布时间', type: 'date', required: false },
      ];
    case 'sighting':
      return [
        { key: 'title', label: '标题', type: 'text', required: true },
        { key: 'authorName', label: '作者/来源', type: 'text', required: true },
        { key: 'originalUrl', label: '原文链接', type: 'text', required: false },
        { key: 'sightedAt', label: '路透时间', type: 'date', required: false },
      ];
    default:
      return [];
  }
}

// --- Helpers ---

function generateSlug(text: string): string {
  // Only keep ASCII letters, digits, hyphens — strip Chinese and special chars
  const base = text
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
  const suffix = Date.now().toString(36);
  return `${base || 'entry'}-${suffix}`;
}

// --- Component ---

export function CreateEntryModal({
  open,
  onClose,
  entityType,
  defaultValues,
}: CreateEntryModalProps) {
  const router = useRouter();
  const { adminToken } = useEditMode();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fields = getFieldConfigs(entityType);

  // Initialize form data when modal opens or entityType changes
  useEffect(() => {
    if (open) {
      const initial: Record<string, string> = {};
      for (const field of fields) {
        initial[field.key] =
          defaultValues?.[field.key] ?? field.defaultValue ?? (field.options?.[0]?.value || '');
      }
      Promise.resolve().then(() => {
        setFormData(initial);
        setError('');
        setLoading(false);
      });
    }
  }, [open, entityType]); // eslint-disable-line react-hooks/exhaustive-deps

  // ESC key to close
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const handleChange = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setError('');
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.key]?.trim()) {
        setError(`请填写${field.label}`);
        return;
      }
    }

    setLoading(true);
    setError('');

    // Generate slug from title or brand
    const slugSource = formData.title || formData.brand || '';
    const slug = generateSlug(slugSource);

    // Build request body
    const body: Record<string, unknown> = { ...formData, slug };

    // Convert numeric fields
    for (const field of fields) {
      if (field.type === 'number' && body[field.key]) {
        body[field.key] = Number(body[field.key]);
      }
    }

    try {
      const res = await fetch(API_ROUTES[entityType], {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(resData?.error || `创建失败 (${res.status})`);
      }

      // Use slug from API response if available, otherwise use generated one
      const finalSlug =
        entityType === 'socialPost'
          ? resData?.data?.id
          : resData?.data?.slug || resData?.slug || slug;

      // Navigate to detail page
      const detailRoute = DETAIL_ROUTES[entityType];
      if (detailRoute) {
        router.push(detailRoute(finalSlug));
        router.refresh();
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'relative mx-4 w-full max-w-md',
          'rounded-[var(--radius-card)] border border-border-gold bg-bg-dark',
          'shadow-2xl shadow-black/40',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-gold/30 px-6 py-4">
          <h2 className="text-lg font-medium text-text-primary">
            新增{ENTITY_LABELS[entityType] || '条目'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted transition-colors hover:text-text-primary"
            aria-label="关闭"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-1.5 block text-sm text-text-secondary">{field.label}</label>

              {field.type === 'select' ? (
                <select
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className={cn(
                    'w-full rounded-md px-3 py-2 text-sm',
                    'border border-border-gold/30 bg-bg-darker text-text-primary',
                    'outline-none transition-colors',
                    'focus:border-accent focus:ring-1 focus:ring-accent/50',
                  )}
                >
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.label}
                  className={cn(
                    'w-full rounded-md px-3 py-2 text-sm',
                    'border border-border-gold/30 bg-bg-darker text-text-primary',
                    'placeholder:text-text-muted/50',
                    'outline-none transition-colors',
                    'focus:border-accent focus:ring-1 focus:ring-accent/50',
                  )}
                />
              )}
            </div>
          ))}

          {/* Error message */}
          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'rounded-md px-5 py-2 text-sm font-medium',
                'bg-accent text-bg-darker',
                'transition-all duration-200',
                'hover:bg-accent/90',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {loading ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
