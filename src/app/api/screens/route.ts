import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getProductions } from '@/lib/queries/productions';

// GET - 影视作品列表（复用查询层）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || undefined;
    const decade = searchParams.get('decade') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getProductions({ type, decade, page, pageSize });

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
    console.error('获取影视作品列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建影视作品（管理端，暂不做鉴权）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 必填字段验证
    if (!body.type || !body.slug || !body.title || !body.year) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: type, slug, title, year',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const production = await prisma.production.create({
      data: {
        type: body.type,
        slug: body.slug,
        title: body.title,
        titleEn: body.titleEn || null,
        year: body.year,
        role: body.role || null,
        synopsis: body.synopsis || null,
        language: body.language || null,
        varietyRegion: body.varietyRegion || null,
        varietyRole: body.varietyRole || null,
        watchLinks: body.watchLinks || null,
      },
      include: { tags: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: production }, { status: 201 });
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

    console.error('创建影视作品失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
