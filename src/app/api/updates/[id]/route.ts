import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

// GET - 获取单条动态（尝试三个表）
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // 尝试从三个表查找
    const socialPost = await prisma.socialPost.findUnique({
      where: { id },
      include: { tags: { select: { name: true, slug: true } } },
    });
    if (socialPost) return NextResponse.json({ data: socialPost, type: 'social' });

    const newsArticle = await prisma.newsArticle.findUnique({
      where: { id },
      include: { tags: { select: { name: true, slug: true } } },
    });
    if (newsArticle) return NextResponse.json({ data: newsArticle, type: 'news' });

    const sighting = await prisma.sighting.findUnique({
      where: { id },
      include: { tags: { select: { name: true, slug: true } } },
    });
    if (sighting) return NextResponse.json({ data: sighting, type: 'sighting' });

    return NextResponse.json({ error: { message: '未找到', code: 'NOT_FOUND' } }, { status: 404 });
  } catch (error) {
    console.error('获取动态详情失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// PUT - 更新动态
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: { message: '未授权', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { type, ...data } = body;

    // 日期字段转换
    if (data.publishedAt) data.publishedAt = new Date(data.publishedAt);
    if (data.sightedAt) data.sightedAt = new Date(data.sightedAt);

    let result;
    if (type === 'social') {
      result = await prisma.socialPost.update({ where: { id }, data });
    } else if (type === 'news') {
      result = await prisma.newsArticle.update({ where: { id }, data });
    } else if (type === 'sighting') {
      result = await prisma.sighting.update({ where: { id }, data });
    } else {
      return NextResponse.json(
        {
          error: { message: '缺少 type 字段', code: 'VALIDATION_ERROR' },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ data: result });
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

    console.error('更新动态失败:', error);
    return NextResponse.json(
      { error: { message: '更新失败', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// DELETE - 删除动态
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: { message: '未授权', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const type = (body as Record<string, string>).type || request.nextUrl.searchParams.get('type');

    if (type === 'social') {
      await prisma.socialPost.delete({ where: { id } });
    } else if (type === 'news') {
      await prisma.newsArticle.delete({ where: { id } });
    } else if (type === 'sighting') {
      await prisma.sighting.delete({ where: { id } });
    } else {
      return NextResponse.json(
        {
          error: { message: '缺少 type 参数', code: 'VALIDATION_ERROR' },
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除动态失败:', error);
    return NextResponse.json(
      { error: { message: '删除失败', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
