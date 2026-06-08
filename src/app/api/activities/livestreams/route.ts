import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getLivestreams } from '@/lib/queries/activities';

// GET - 直播列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const platform = searchParams.get('platform') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getLivestreams({ platform, page, pageSize });

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
    console.error('获取直播列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建直播
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.slug || !body.title || !body.date || !body.platform) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: slug, title, date, platform',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const livestream = await prisma.livestream.create({
      data: {
        slug: body.slug,
        title: body.title,
        platform: body.platform,
        date: new Date(body.date),
        summary: body.summary || null,
        originalUrl: body.originalUrl || null,
        replayUrl: body.replayUrl || null,
        duration: body.duration || null,
      },
      include: { tags: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: livestream }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      'code' in error &&
      (error as Record<string, unknown>).code === 'P2002'
    ) {
      return NextResponse.json(
        {
          error: {
            message: '该 slug 已存在，请使用其他值',
            code: 'CONFLICT',
          },
        },
        { status: 409 },
      );
    }

    console.error('创建直播失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
