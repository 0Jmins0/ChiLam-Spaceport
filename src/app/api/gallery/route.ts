import { NextRequest, NextResponse } from 'next/server';
import { getGalleryItems, getGalleryCounts } from '@/lib/queries/gallery';
import type { MediaCategory } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

const VALID_CATEGORIES = ['IMAGE', 'VIDEO', 'AUDIO'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');
    const mediaTag = searchParams.get('mediaTag');
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 24, 100);
    const mode = searchParams.get('mode');

    if (mode === 'counts') {
      const counts = await getGalleryCounts();
      return NextResponse.json(counts);
    }

    if (category && !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `无效的分类: ${category}` }, { status: 400 });
    }

    const data = await getGalleryItems({
      category: category as MediaCategory | undefined,
      mediaTag: mediaTag || undefined,
      page,
      pageSize,
    });

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
    console.error('Gallery query error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
