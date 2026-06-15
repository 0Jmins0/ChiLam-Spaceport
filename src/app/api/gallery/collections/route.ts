import { NextRequest, NextResponse } from 'next/server';
import { getCollections } from '@/lib/queries/gallery';
import { verifyAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 24, 100);

    const data = await getCollections({ page, pageSize });

    return NextResponse.json({
      data: data.items,
      pagination: {
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCount: data.totalCount,
        hasMore: data.hasMore,
      },
    });
  } catch (error) {
    console.error('Collections query error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, date, relatedType, relatedId, mediaIds } = body;

    if (!title) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }

    // 自动生成 slug
    const baseSlug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-|-$/g, '') || `collection-${Date.now()}`;

    const existing = await prisma.mediaCollection.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

    const collection = await prisma.mediaCollection.create({
      data: {
        slug,
        title,
        description: description || null,
        date: date ? new Date(date) : null,
        relatedType: relatedType || null,
        relatedId: relatedId || null,
        items: mediaIds?.length
          ? { connect: mediaIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Collection create error:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
