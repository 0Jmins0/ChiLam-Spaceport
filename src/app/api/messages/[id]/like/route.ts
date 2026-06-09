import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUser } from '@/lib/auth';

// POST - 点赞/取消点赞 toggle
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: { message: '请先登录', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const { id } = await params;

    // 确认留言存在
    const guestbook = await prisma.guestbook.findUnique({ where: { id } });
    if (!guestbook) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: userPayload.userId,
          targetType: 'guestbook',
          targetId: id,
        },
      },
    });

    if (existingLike) {
      // 取消点赞
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existingLike.id } }),
        prisma.guestbook.update({
          where: { id },
          data: { likesCount: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: userPayload.userId },
          data: {
            givenLikesCount: { decrement: 1 },
            starlight: { decrement: 1 },
          },
        }),
        ...(guestbook.userId
          ? [
              prisma.user.update({
                where: { id: guestbook.userId },
                data: {
                  receivedLikesCount: { decrement: 1 },
                  starlight: { decrement: 1 },
                },
              }),
            ]
          : []),
      ]);

      const updated = await prisma.guestbook.findUnique({
        where: { id },
        select: { likesCount: true },
      });

      return NextResponse.json({
        data: { id, likesCount: updated?.likesCount ?? 0, liked: false },
      });
    } else {
      // 点赞
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId: userPayload.userId,
            targetType: 'guestbook',
            targetId: id,
          },
        }),
        prisma.guestbook.update({
          where: { id },
          data: { likesCount: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: userPayload.userId },
          data: {
            givenLikesCount: { increment: 1 },
            starlight: { increment: 1 },
          },
        }),
        ...(guestbook.userId
          ? [
              prisma.user.update({
                where: { id: guestbook.userId },
                data: {
                  receivedLikesCount: { increment: 1 },
                  starlight: { increment: 1 },
                },
              }),
            ]
          : []),
      ]);

      const updated = await prisma.guestbook.findUnique({
        where: { id },
        select: { likesCount: true },
      });

      return NextResponse.json({
        data: { id, likesCount: updated?.likesCount ?? 0, liked: true },
      });
    }
  } catch (error) {
    console.error('点赞操作失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// GET - 检查当前用户是否已点赞
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json({ data: { liked: false } });
    }

    const { id } = await params;
    const like = await prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: userPayload.userId,
          targetType: 'guestbook',
          targetId: id,
        },
      },
    });

    return NextResponse.json({ data: { liked: !!like } });
  } catch {
    return NextResponse.json({ data: { liked: false } });
  }
}
