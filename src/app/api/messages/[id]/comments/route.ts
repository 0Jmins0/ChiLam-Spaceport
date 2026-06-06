import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCommentsByTarget } from '@/lib/queries/guestbook';

// GET - 获取评论列表
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;

    const data = await getCommentsByTarget('guestbook', id, page);

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
    console.error('获取评论列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建评论
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 验证
    if (!body.nickname?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: { message: '昵称和内容为必填项', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    if (body.content.trim().length > 300) {
      return NextResponse.json(
        { error: { message: '评论内容不能超过300字', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    // 确认留言存在
    const guestbook = await prisma.guestbook.findUnique({ where: { id } });
    if (!guestbook) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        targetType: 'guestbook',
        targetId: id,
        nickname: body.nickname.trim(),
        content: body.content.trim(),
      },
    });

    return NextResponse.json(
      {
        data: {
          id: comment.id,
          nickname: comment.nickname,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('创建评论失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
