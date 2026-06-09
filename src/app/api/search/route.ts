import { NextRequest, NextResponse } from 'next/server';
import { searchPreview, searchFull } from '@/lib/queries/search';
import type { SearchResultType } from '@/lib/types';

const VALID_TYPES: SearchResultType[] = [
  'social_post',
  'news',
  'sighting',
  'production',
  'performance',
  'endorsement',
  'interview',
  'livestream',
  'album',
  'magazine',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: { message: '关键词至少需要 2 个字符', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const mode = searchParams.get('mode');

    if (mode === 'preview') {
      const result = await searchPreview(q);
      return NextResponse.json(result);
    }

    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 50);

    if (type !== 'all' && !VALID_TYPES.includes(type as SearchResultType)) {
      return NextResponse.json(
        { error: { message: '无效的类型筛选', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const result = await searchFull({
      q,
      type: type as SearchResultType | 'all',
      page,
      pageSize,
    });

    return NextResponse.json({
      data: result.items,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    console.error('搜索失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
