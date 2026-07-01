import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSocialPosts } from '@/lib/queries/updates';

// GET - 社交帖列表（复用查询层）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const platform = searchParams.get('platform') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getSocialPosts({ platform, page, pageSize });

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
    console.error('获取社交帖列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建社交帖（管理端，P1 暂不做鉴权）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 基本验证
    if (!body.platform) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: platform',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const post = await prisma.socialPost.create({
      data: {
        platform: body.platform,
        originalUrl: body.originalUrl || null,
        originalId: body.originalId || null,
        title: body.title || null,
        summary: body.summary || null,
        thumbnailUrl: body.thumbnailUrl || null,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        importMethod: body.importMethod || 'MANUAL',
      },
      include: { tags: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: post }, { status: 201 });
  } catch (error) {
    console.error('创建社交帖失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
