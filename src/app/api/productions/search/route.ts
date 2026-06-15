import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET - 搜索综艺节目
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    if (q.length < 1) {
      return NextResponse.json({ data: [] });
    }

    const productions = await prisma.production.findMany({
      where: {
        type: 'VARIETY_SHOW',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { titleEn: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        title: true,
        titleEn: true,
        slug: true,
        year: true,
      },
      orderBy: { year: 'desc' },
      take: 10,
    });

    return NextResponse.json({ data: productions });
  } catch (error) {
    console.error('搜索综艺失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
