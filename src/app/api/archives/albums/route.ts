import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAlbums } from '@/lib/queries/archives';

// GET - 专辑列表（复用查询层）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const language = searchParams.get('language') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getAlbums({ language, page, pageSize });

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
    console.error('获取专辑列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建专辑（管理端，暂不做鉴权）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 必填字段验证
    if (!body.slug || !body.title || !body.releaseYear) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: slug, title, releaseYear',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const album = await prisma.album.create({
      data: {
        slug: body.slug,
        title: body.title,
        releaseYear: body.releaseYear,
        language: body.language || null,
        tracks: body.tracks || null,
        streamingLinks: body.streamingLinks || null,
      },
      include: { tags: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: album }, { status: 201 });
  } catch (error) {
    // slug 唯一性冲突
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

    console.error('创建专辑失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
