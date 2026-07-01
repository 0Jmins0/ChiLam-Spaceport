export const CONTENT_TYPE_LABELS: Record<string, string> = {
  social_post: '社交动态',
  news_article: '新闻',
  sighting: '路透',
  production: '影视综',
  performance: '演出',
  endorsement: '代言',
  interview: '访谈',
  livestream: '直播',
  album: '专辑',
  magazine: '杂志',
};

export const ALLOWED_CONTENT_TYPES = Object.keys(CONTENT_TYPE_LABELS);

export type RelatedContentSummary = {
  type: string;
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
  relationType?: string;
  relationId?: string;
};

export function isAllowedContentType(type: unknown): type is string {
  return typeof type === 'string' && ALLOWED_CONTENT_TYPES.includes(type);
}

export function getContentUrl(type: string, item: { id: string; slug?: string | null }) {
  if (type === 'social_post') return `/updates/social/${item.id}`;
  if (type === 'news_article') return `/updates/news/${item.slug}`;
  if (type === 'sighting') return `/updates/sightings/${item.slug}`;
  if (type === 'production') return `/screens/${item.slug}`;
  if (type === 'performance') return `/performances/${item.slug}`;
  if (type === 'endorsement') return `/activities/endorsements/${item.slug}`;
  if (type === 'livestream') return `/activities/livestreams/${item.slug}`;
  if (type === 'interview') return `/interviews/${item.slug}`;
  if (type === 'album') return `/archives/albums/${item.slug}`;
  if (type === 'magazine') return `/archives/magazines/${item.slug}`;
  return '#';
}
