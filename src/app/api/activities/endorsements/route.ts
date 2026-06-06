import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getEndorsements } from '@/lib/queries/activities';

// GET - 代言列表（复用查询层）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getEndorsements({ page, pageSize });

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
    console.error('获取代言列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建代言（管理端，暂不做鉴权）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 必填字段验证
    if (!body.slug || !body.brand || !body.startYear) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: slug, brand, startYear',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const endorsement = await prisma.endorsement.create({
      data: {
        slug: body.slug,
        brand: body.brand,
        startYear: body.startYear,
        role: body.role || null,
        category: body.category || null,
        description: body.description || null,
        endYear: body.endYear || null,
      },
      include: { tags: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: endorsement }, { status: 201 });
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

    console.error('创建代言失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
