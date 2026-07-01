import { prisma } from '@/lib/db';
import { getContentUrl, type RelatedContentSummary } from '@/lib/content-types';

export async function contentExists(type: string, id: string) {
  return Boolean(await getContentSummary(type, id));
}

export async function getContentSummary(
  type: string,
  id: string,
): Promise<RelatedContentSummary | null> {
  if (type === 'social_post') {
    const item = await prisma.socialPost.findUnique({
      where: { id },
      select: { id: true, title: true, summary: true, platform: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title ?? item.summary?.slice(0, 40) ?? '未命名社交动态',
      subtitle: item.platform,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'news_article') {
    const item = await prisma.newsArticle.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, source: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title,
      subtitle: item.source,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'sighting') {
    const item = await prisma.sighting.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, authorName: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title,
      subtitle: item.authorName,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'production') {
    const item = await prisma.production.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, year: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title,
      subtitle: item.year ? String(item.year) : null,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'performance') {
    const item = await prisma.performance.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, city: true, year: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title,
      subtitle: [item.city, item.year].filter(Boolean).join(' · ') || null,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'endorsement') {
    const item = await prisma.endorsement.findUnique({
      where: { id },
      select: { id: true, slug: true, brand: true, category: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.brand,
      subtitle: item.category,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'livestream') {
    const item = await prisma.livestream.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, platform: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title,
      subtitle: item.platform,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'interview') {
    const item = await prisma.interview.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, source: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title,
      subtitle: item.source,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'album') {
    const item = await prisma.album.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, releaseYear: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title,
      subtitle: item.releaseYear ? String(item.releaseYear) : null,
      url: getContentUrl(type, item),
    };
  }

  if (type === 'magazine') {
    const item = await prisma.magazine.findUnique({
      where: { id },
      select: { id: true, slug: true, title: true, issue: true },
    });
    if (!item) return null;
    return {
      type,
      id: item.id,
      title: item.title,
      subtitle: item.issue,
      url: getContentUrl(type, item),
    };
  }

  return null;
}

export async function hydrateRelationTargets(
  relations: { id: string; targetType: string; targetId: string; relationType: string }[],
) {
  const related: RelatedContentSummary[] = [];

  for (const relation of relations) {
    const summary = await getContentSummary(relation.targetType, relation.targetId);
    if (summary) {
      related.push({
        ...summary,
        relationId: relation.id,
        relationType: relation.relationType,
      });
    }
  }

  return related;
}

export async function hydrateRelationSources(
  relations: { id: string; sourceType: string; sourceId: string; relationType: string }[],
) {
  const related: RelatedContentSummary[] = [];

  for (const relation of relations) {
    const summary = await getContentSummary(relation.sourceType, relation.sourceId);
    if (summary) {
      related.push({
        ...summary,
        relationId: relation.id,
        relationType: relation.relationType,
      });
    }
  }

  return related;
}

export async function getOutgoingRelatedContent(sourceType: string, sourceId: string) {
  const relations = await prisma.contentRelation.findMany({
    where: { sourceType, sourceId },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return hydrateRelationTargets(relations);
}

export async function getIncomingRelatedContent(
  targetType: string,
  targetId: string,
  options?: { sourceTypes?: string[] },
) {
  const relations = await prisma.contentRelation.findMany({
    where: {
      targetType,
      targetId,
      ...(options?.sourceTypes ? { sourceType: { in: options.sourceTypes } } : {}),
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return hydrateRelationSources(relations);
}
