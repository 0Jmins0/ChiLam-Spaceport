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

// ─── 影视模块 ───

// 影视综 Tab 类型
export type ScreenTab = 'movie' | 'tv_series' | 'variety_show';

// 年代筛选
export type DecadeFilter = '1990' | '2000' | '2010' | '2020';

// 影视作品卡片展示用
export interface ProductionItem {
  id: string;
  type: string;
  slug: string;
  title: string;
  titleEn: string | null;
  year: number;
  role: string | null;
  synopsis: string | null;
  posterUrl: string | null;
  language: string | null;
  varietyRegion: string | null;
  varietyRole: string | null;
  tags: { name: string; slug: string }[];
}

// 影视作品详情页用（含 gallery + watchLinks）
export interface ProductionDetail extends ProductionItem {
  watchLinks: { platform: string; url: string }[] | null;
  gallery: { url: string; alt: string | null }[];
}

// ─── 演出模块 ───

// 演出 Tab 类型
export type PerformanceTab = 'concert' | 'stage' | 'musical';

// 演出卡片展示用
export interface PerformanceItem {
  id: string;
  type: string; // PerformanceType enum
  slug: string;
  title: string;
  titleEn: string | null;
  year: number;
  startDate: Date | null;
  endDate: Date | null;
  venue: string | null;
  city: string | null;
  series: string | null;
  posterUrl: string | null; // 从 poster 关系展平
  tags: { name: string; slug: string }[];
}

// 官摄素材项
export interface OfficialMediaItem {
  id: string;
  title: string | null;
  mediaUrl: string;
  mediaType: string;
}

// 饭拍项
export interface FanShotItem {
  id: string;
  title: string | null;
  summary: string | null;
  originalUrl: string | null;
  thumbnailUrl: string | null;
  authorName: string;
}

// 演出详情页用
export interface PerformanceDetail extends PerformanceItem {
  setlist: string[] | null;
  officialMedia: OfficialMediaItem[];
  fanShots: FanShotItem[];
}
