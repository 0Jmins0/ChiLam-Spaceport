// 更新模块的 Tab 类型
export type UpdateTab = 'social' | 'news' | 'sighting';

// 平台筛选
export type Platform = 'weibo' | 'xiaohongshu' | 'douyin' | 'instagram' | 'facebook';

// 路透类型筛选
export type SightingType = '机场' | '片场' | '偶遇';

// 分页响应包装
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

// 时间线事件（首页展示用）
export interface TimelineEventItem {
  id: string;
  date: Date;
  title: string;
  description: string | null;
  relatedType: string | null;
  relatedId: string | null;
}

// 社交帖卡片展示用
export interface SocialPostItem {
  id: string;
  platform: string;
  originalUrl: string;
  title: string | null;
  summary: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  tags: { name: string; slug: string }[];
}

// 新闻卡片
export interface NewsArticleItem {
  id: string;
  slug: string;
  originalUrl: string;
  title: string;
  summary: string | null;
  source: string | null;
  thumbnailUrl: string | null;
  publishedAt: Date | null;
  tags: { name: string; slug: string }[];
}

// 路透卡片
export interface SightingItem {
  id: string;
  slug: string;
  originalUrl: string | null;
  title: string;
  summary: string | null;
  thumbnailUrl: string | null;
  sightedAt: Date | null;
  authorName: string;
  tags: { name: string; slug: string }[];
}
