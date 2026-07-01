import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const typeToModel = {
  social: prisma.socialPost,
  news: prisma.newsArticle,
  sighting: prisma.sighting,
} as const;

type UpdateItemType = keyof typeof typeToModel;

function isUpdateItemType(value: unknown): value is UpdateItemType {
  return typeof value === 'string' && value in typeToModel;
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  if (!isUpdateItemType(type)) {
    return NextResponse.json({ error: 'type 无效' }, { status: 400 });
  }

  if (type === 'social') {
    const items = await prisma.socialPost.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        platform: true,
        title: true,
        summary: true,
        originalUrl: true,
        publishedAt: true,
        isVisible: true,
      },
    });
    return NextResponse.json({ data: items });
  }

  if (type === 'news') {
    const items = await prisma.newsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 100,
      select: {
        id: true,
        slug: true,
        title: true,
        source: true,
        originalUrl: true,
        publishedAt: true,
        isVisible: true,
      },
    });
    return NextResponse.json({ data: items });
  }

  const items = await prisma.sighting.findMany({
    orderBy: { sightedAt: 'desc' },
    take: 100,
    select: {
      id: true,
      slug: true,
      title: true,
      authorName: true,
      sightedAt: true,
      status: true,
      isVisible: true,
    },
  });
  return NextResponse.json({ data: items });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { type, id, isVisible } = body ?? {};

  if (!isUpdateItemType(type) || typeof id !== 'string' || typeof isVisible !== 'boolean') {
    return NextResponse.json({ error: 'type、id 或 isVisible 无效' }, { status: 400 });
  }

  const updated =
    type === 'social'
      ? await prisma.socialPost.update({
          where: { id },
          data: { isVisible },
          select: { id: true, isVisible: true },
        })
      : type === 'news'
        ? await prisma.newsArticle.update({
            where: { id },
            data: { isVisible },
            select: { id: true, isVisible: true },
          })
        : await prisma.sighting.update({
            where: { id },
            data: { isVisible },
            select: { id: true, isVisible: true },
          });

  return NextResponse.json({ data: updated });
}
