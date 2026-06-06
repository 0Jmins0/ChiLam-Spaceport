import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getMagazines } from '@/lib/queries/archives';

// GET - 杂志列表（复用查询层）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getMagazines({ page, pageSize });

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
    console.error('获取杂志列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建杂志（管理端，暂不做鉴权）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 必填字段验证
    if (!body.slug || !body.title || !body.date) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: slug, title, date',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const magazine = await prisma.magazine.create({
      data: {
        slug: body.slug,
        title: body.title,
        date: new Date(body.date),
        issue: body.issue || null,
      },
      include: { tags: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: magazine }, { status: 201 });
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

    console.error('创建杂志失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
