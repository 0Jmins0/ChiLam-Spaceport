import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getMagazineBySlug } from '@/lib/queries/archives';

// GET - 获取单个杂志详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const magazine = await getMagazineBySlug(slug);

    if (!magazine) {
      return NextResponse.json(
        { error: { message: '未找到', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: magazine });
  } catch (error) {
    console.error('获取杂志详情失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// PUT - 更新杂志
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const body = await request.json();

    // 只允许更新指定字段
    const allowedFields = ['title', 'issue', 'date', 'isVisible'] as const;

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        // date 字段需要转换为 Date 对象
        data[field] = field === 'date' ? new Date(body[field] as string) : body[field];
      }
    }

    const result = await prisma.magazine.update({
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

    console.error('更新杂志失败:', error);
    return NextResponse.json(
      { error: { message: '更新失败', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// DELETE - 删除杂志
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    await prisma.magazine.delete({ where: { slug } });

    return NextResponse.json({ success: true });
  } catch (error) {
    // 记录未找到
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: { message: '未找到', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    console.error('删除杂志失败:', error);
    return NextResponse.json(
      { error: { message: '删除失败', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
