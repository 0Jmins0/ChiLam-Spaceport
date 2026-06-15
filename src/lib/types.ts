// 更新模块的 Tab 类型
export type UpdateTab = 'social' | 'news' | 'sighting';

// 平台筛选
export type Platform = 'weibo' | 'xiaohongshu' | 'douyin' | 'instagram' | 'facebook';

// 路透类型筛选
export type SightingType = '机场' | '片场' | '偶遇' | '其他';

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
  posterWidth: number | null;
  posterHeight: number | null;
  language: string | null;
  varietyRegion: string | null;
  varietyRole: string | null;
  roleType: string | null;
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
  posterWidth: number | null;
  posterHeight: number | null;
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
  summary: string | null;
  setlist: string[] | null;
  officialMedia: OfficialMediaItem[];
  fanShots: FanShotItem[];
}

// ─── 活动模块 ───

// 活动 Tab 类型
export type ActivityTab = 'endorsement' | 'livestream';

// 访谈媒体类型筛选
export type InterviewMediaFilter = 'video' | 'audio' | 'text';

// 代言卡片展示用
export interface EndorsementItem {
  id: string;
  slug: string;
  brand: string;
  role: string | null;
  category: string | null;
  description: string | null;
  startYear: number;
  endYear: number | null;
  mediaUrls: { url: string; alt: string | null; width: number | null; height: number | null }[];
  tags: { name: string; slug: string }[];
}

// 代言详情页用（当前与列表项相同，后续可扩展）
export type EndorsementDetail = EndorsementItem;

// 访谈卡片展示用
export interface InterviewItem {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  source: string | null;
  host: string | null;
  location: string | null;
  duration: string | null;
  date: Date;
  mediaType: string; // InterviewMediaType enum
  originalUrl: string | null;
  tags: { name: string; slug: string }[];
}

// 访谈详情页用
export interface InterviewDetail extends InterviewItem {
  transcriptCantonese: unknown;
  transcriptMandarin: unknown;
  proofreadStatus: string;
  originalMediaUrl: string | null;
  embedUrl: string | null;
  galleryImages: { url: string; alt: string | null }[];
}

// 直播卡片展示用
export interface LivestreamItem {
  id: string;
  slug: string;
  title: string;
  platform: string;
  date: string;
  summary: string | null;
  originalUrl: string | null;
  replayUrl: string | null;
  duration: number | null;
  coverImageUrl: string | null;
  tags: { name: string; slug: string }[];
}

// 直播详情页用
export interface LivestreamDetail extends LivestreamItem {
  media: { url: string; type: string }[];
}

// ─── 资料库模块 ───

// 资料库 Tab 类型
export type ArchiveTab = 'album' | 'magazine';

// 专辑卡片展示用
export interface AlbumItem {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  language: string | null;
  coverUrl: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  tags: { name: string; slug: string }[];
}

// 专辑详情页用
export interface AlbumDetail extends AlbumItem {
  tracks: string[] | null;
  streamingLinks: Record<string, string> | null;
}

// 杂志卡片展示用
export interface MagazineItem {
  id: string;
  slug: string;
  title: string;
  issue: string | null;
  date: Date;
  coverUrl: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  tags: { name: string; slug: string }[];
}

// 杂志详情页用
export interface MagazineDetail extends MagazineItem {
  scans: { url: string; alt: string | null }[];
}

// ═══════ 留言板 (Guestbook) ═══════
export type MessageTab = 'message' | 'story' | 'feedback';

export interface ImageCropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GuestbookItem {
  id: string;
  tab: MessageTab;
  nickname: string;
  content: string;
  storyTags: string[];
  relatedYear: number | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  userId: string | null;
  isFeatured: boolean;
  thumbnail: string | null;
  imageCropData: ImageCropData | null;
  imageAsBackground: boolean;
}

export interface GuestbookDetail extends GuestbookItem {
  images: { url: string; alt: string | null }[];
}

export interface CommentItem {
  id: string;
  nickname: string;
  content: string;
  createdAt: string;
  userId: string | null;
  image: { url: string; alt: string | null } | null;
}

// ═══════ 公告 (Announcements) ═══════
export type AnnouncementTab = 'notice' | 'rule' | 'update';

export interface AnnouncementItem {
  id: string;
  type: AnnouncementTab;
  title: string;
  content: string;
  isPinned: boolean;
  publishDate: string;
}

export interface AnnouncementDetail extends AnnouncementItem {
  createdAt: string;
  updatedAt: string;
}

// ═══════ 搜索 (Search) ═══════
export type SearchResultType =
  | 'social_post'
  | 'news'
  | 'sighting'
  | 'production'
  | 'performance'
  | 'endorsement'
  | 'interview'
  | 'livestream'
  | 'album'
  | 'magazine';

export interface SearchResultItem {
  type: SearchResultType;
  id: string;
  title: string;
  snippet: string | null;
  url: string;
  date: string | null;
  typeLabel: string;
}

export interface SearchPreviewResult {
  groups: {
    type: SearchResultType;
    typeLabel: string;
    items: SearchResultItem[];
    totalCount: number;
  }[];
  totalCount: number;
}

// ═══════ 相册 (Gallery) ═══════
export type GalleryTab = 'all' | 'image' | 'video' | 'audio' | 'collection';

export interface GalleryItem {
  id: string;
  type: string; // MediaType enum
  category: string | null; // MediaCategory enum
  mediaTag: string | null;
  url: string;
  thumbnailUrl: string | null;
  filename: string | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  alt: string | null;
  caption: string | null;
  createdAt: string;
  // 关联来源（反查）
  source: { type: string; title: string; slug: string } | null;
}

export interface GalleryCollectionItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  date: string | null;
  coverUrl: string | null;
  itemCount: number;
}

export interface GalleryCollectionDetail extends GalleryCollectionItem {
  items: GalleryItem[];
  relatedType: string | null;
  relatedId: string | null;
}
