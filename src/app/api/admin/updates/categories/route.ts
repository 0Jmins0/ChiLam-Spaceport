import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import { UPDATE_CATEGORY_SLUGS, getUpdateCategoryStates } from '@/lib/queries/updates';

export const dynamic = 'force-dynamic';

const categoryMeta: Record<string, { name: string; path: string; level: number; sortOrder: number }> = {
  [UPDATE_CATEGORY_SLUGS.root]: { name: '动态', path: '/updates', level: 1, sortOrder: 10 },
  [UPDATE_CATEGORY_SLUGS.social]: {
    name: '社交媒体',
    path: '/updates?tab=social',
    level: 2,
    sortOrder: 1,
  },
  [UPDATE_CATEGORY_SLUGS.news]: {
    name: '新闻',
    path: '/updates?tab=news',
    level: 2,
    sortOrder: 2,
  },
  [UPDATE_CATEGORY_SLUGS.sighting]: {
    name: '路透',
    path: '/updates?tab=sighting',
    level: 2,
    sortOrder: 3,
  },
};

const allowedSlugs = new Set(Object.values(UPDATE_CATEGORY_SLUGS));

async function ensureUpdateCategories() {
  const rootMeta = categoryMeta[UPDATE_CATEGORY_SLUGS.root];
  const root = await prisma.category.upsert({
    where: { slug: UPDATE_CATEGORY_SLUGS.root },
    update: {
      name: rootMeta.name,
      path: rootMeta.path,
      level: rootMeta.level,
      sortOrder: rootMeta.sortOrder,
    },
    create: {
      slug: UPDATE_CATEGORY_SLUGS.root,
      name: rootMeta.name,
      path: rootMeta.path,
      level: rootMeta.level,
      sortOrder: rootMeta.sortOrder,
    },
  });

  for (const slug of [
    UPDATE_CATEGORY_SLUGS.social,
    UPDATE_CATEGORY_SLUGS.news,
    UPDATE_CATEGORY_SLUGS.sighting,
  ]) {
    const meta = categoryMeta[slug];
    await prisma.category.upsert({
      where: { slug },
      update: {
        parentId: root.id,
        name: meta.name,
        path: meta.path,
        level: meta.level,
        sortOrder: meta.sortOrder,
      },
      create: {
        parentId: root.id,
        slug,
        name: meta.name,
        path: meta.path,
        level: meta.level,
        sortOrder: meta.sortOrder,
      },
    });
  }
}

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const categories = await getUpdateCategoryStates();
  return NextResponse.json({ data: categories });
}

export async function PATCH(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const slug = body?.slug;
  const isVisible = body?.isVisible;

  if (!allowedSlugs.has(slug) || typeof isVisible !== 'boolean') {
    return NextResponse.json({ error: 'slug 或 isVisible 无效' }, { status: 400 });
  }

  await ensureUpdateCategories();
  const updated = await prisma.category.update({
    where: { slug },
    data: { isVisible },
    select: { slug: true, name: true, isVisible: true },
  });

  return NextResponse.json({ data: updated });
}
