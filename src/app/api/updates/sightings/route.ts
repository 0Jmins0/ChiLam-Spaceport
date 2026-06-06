import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSightings } from '@/lib/queries/updates';

// GET - 路透列表（复用查询层，支持 sightingType 筛选）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const sightingType = searchParams.get('sightingType') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getSightings({ sightingType, page, pageSize });

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
    console.error('获取路透列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建路透（管理端，P1 暂不做鉴权）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 基本验证
    if (!body.title || !body.slug || !body.authorName) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: title, slug, authorName',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const sighting = await prisma.sighting.create({
      data: {
        slug: body.slug,
        title: body.title,
        originalUrl: body.originalUrl || null,
        summary: body.summary || null,
        thumbnailUrl: body.thumbnailUrl || null,
        sightedAt: body.sightedAt ? new Date(body.sightedAt) : null,
        content: body.content || null,
        isFullCopy: body.isFullCopy || false,
        authorName: body.authorName,
        submitType: body.submitType || 'LINK',
        status: 'PENDING',
      },
      include: { tags: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: sighting }, { status: 201 });
  } catch (error) {
    // slug 唯一性冲突
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          error: {
            message: 'slug 已存在，请使用其他值',
            code: 'CONFLICT',
          },
        },
        { status: 409 },
      );
    }

    console.error('创建路透失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
