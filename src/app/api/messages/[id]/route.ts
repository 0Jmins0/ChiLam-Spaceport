import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getGuestbookById } from '@/lib/queries/guestbook';

// GET - 单条留言详情
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await getGuestbookById(id);

    if (!item) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    console.error('获取留言详情失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// PUT - 更新留言（管理端）
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.guestbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    const updated = await prisma.guestbook.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.content && { content: body.content }),
        ...(body.storyTags && { storyTags: body.storyTags }),
        ...(body.relatedYear !== undefined && { relatedYear: body.relatedYear }),
      },
    });

    return NextResponse.json({ data: { id: updated.id, status: updated.status } });
  } catch (error) {
    console.error('更新留言失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// DELETE - 删除留言
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const existing = await prisma.guestbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    // 同时删除关联评论
    await prisma.comment.deleteMany({ where: { targetType: 'guestbook', targetId: id } });
    await prisma.guestbook.delete({ where: { id } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('删除留言失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
