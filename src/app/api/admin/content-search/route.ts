import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { CONTENT_TYPE_LABELS, getContentUrl, isAllowedContentType } from '@/lib/content-types';

export const dynamic = 'force-dynamic';

type SearchResult = {
  type: string;
  id: string;
  title: string;
  subtitle: string | null;
  url: string;
};

async function searchType(type: string, q: string): Promise<SearchResult[]> {
  if (type === 'production') {
    const items = await prisma.production.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { titleEn: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, title: true, year: true },
      orderBy: { year: 'desc' },
      take: 8,
    });
    return items.map((item) => ({
      type,
      id: item.id,
      title: item.title,
      subtitle: item.year ? String(item.year) : null,
      url: getContentUrl(type, item),
    }));
  }

  if (type === 'performance') {
    const items = await prisma.performance.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { titleEn: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, title: true, city: true, year: true },
      orderBy: { startDate: { sort: 'desc', nulls: 'last' } },
      take: 8,
    });
    return items.map((item) => ({
      type,
      id: item.id,
      title: item.title,
      subtitle: [item.city, item.year].filter(Boolean).join(' · ') || null,
      url: getContentUrl(type, item),
    }));
  }

  if (type === 'endorsement') {
    const items = await prisma.endorsement.findMany({
      where: {
        OR: [
          { brand: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, brand: true, category: true },
      orderBy: { startYear: 'desc' },
      take: 8,
    });
    return items.map((item) => ({
      type,
      id: item.id,
      title: item.brand,
      subtitle: item.category,
      url: getContentUrl(type, item),
    }));
  }

  if (type === 'livestream') {
    const items = await prisma.livestream.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { platform: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, title: true, platform: true },
      orderBy: { date: 'desc' },
      take: 8,
    });
    return items.map((item) => ({
      type,
      id: item.id,
      title: item.title,
      subtitle: item.platform,
      url: getContentUrl(type, item),
    }));
  }

  if (type === 'interview') {
    const items = await prisma.interview.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { source: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, title: true, source: true },
      orderBy: { date: 'desc' },
      take: 8,
    });
    return items.map((item) => ({
      type,
      id: item.id,
      title: item.title,
      subtitle: item.source,
      url: getContentUrl(type, item),
    }));
  }

  if (type === 'album') {
    const items = await prisma.album.findMany({
      where: { title: { contains: q, mode: 'insensitive' } },
      select: { id: true, slug: true, title: true, releaseYear: true },
      orderBy: { releaseYear: 'desc' },
      take: 8,
    });
    return items.map((item) => ({
      type,
      id: item.id,
      title: item.title,
      subtitle: item.releaseYear ? String(item.releaseYear) : null,
      url: getContentUrl(type, item),
    }));
  }

  if (type === 'magazine') {
    const items = await prisma.magazine.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { issue: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, slug: true, title: true, issue: true },
      orderBy: { date: 'desc' },
      take: 8,
    });
    return items.map((item) => ({
      type,
      id: item.id,
      title: item.title,
      subtitle: item.issue,
      url: getContentUrl(type, item),
    }));
  }

  return [];
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const requestedTypes = (searchParams.get('types') ?? 'production,performance,endorsement,livestream,interview,album,magazine')
    .split(',')
    .map((type) => type.trim())
    .filter(Boolean);

  if (q.length < 1) return NextResponse.json({ data: [] });

  const types = requestedTypes.filter(isAllowedContentType);
  const groups = await Promise.all(types.map((type) => searchType(type, q)));
  const data = groups.flat().map((item) => ({
    ...item,
    typeLabel: CONTENT_TYPE_LABELS[item.type] ?? item.type,
  }));

  return NextResponse.json({ data });
}
