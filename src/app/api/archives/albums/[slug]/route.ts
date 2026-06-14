import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAlbumBySlug } from '@/lib/queries/archives';

// GET - 获取单个专辑详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const album = await getAlbumBySlug(slug);

    if (!album) {
      return NextResponse.json(
        { error: { message: '未找到', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: album });
  } catch (error) {
    console.error('获取专辑详情失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// PUT - 更新专辑
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // 只允许更新指定字段
    const allowedFields = [
      'title',
      'releaseYear',
      'language',
      'tracks',
      'streamingLinks',
      'releaseDate',
      'sortOrder',
      'isVisible',
    ] as const;

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        data[field] = body[field];
      }
    }

    const result = await prisma.album.update({
      where: { slug },
      data,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    // slug 唯一性冲突
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: { message: 'slug 已存在，请使用其他值', code: 'CONFLICT' } },
        { status: 409 },
      );
    }

    // 记录未找到
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: { message: '未找到', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    console.error('更新专辑失败:', error);
    return NextResponse.json(
      { error: { message: '更新失败', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// DELETE - 删除专辑
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    await prisma.album.delete({ where: { slug } });

    return NextResponse.json({ success: true });
  } catch (error) {
    // 记录未找到
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: { message: '未找到', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    console.error('删除专辑失败:', error);
    return NextResponse.json(
      { error: { message: '删除失败', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
