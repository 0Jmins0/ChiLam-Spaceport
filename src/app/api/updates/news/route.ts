import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getNewsArticles } from '@/lib/queries/updates';

// GET - 新闻列表（复用查询层）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getNewsArticles({ page, pageSize });

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
    console.error('获取新闻列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建新闻（管理端，P1 暂不做鉴权）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 基本验证
    if (!body.title || !body.slug) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: title, slug',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const article = await prisma.newsArticle.create({
      data: {
        slug: body.slug,
        originalUrl: body.originalUrl?.trim() || '',
        title: body.title,
        summary: body.summary || null,
        source: body.source || null,
        thumbnailUrl: body.thumbnailUrl || null,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
        contentText: body.contentText || null,
        isFullCopy: body.isFullCopy || false,
      },
      include: { tags: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({ data: article }, { status: 201 });
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

    console.error('创建新闻失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
