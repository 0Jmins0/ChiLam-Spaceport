import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: { message: '未登录或 token 已过期', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        role: true,
        postsCount: true,
        receivedLikesCount: true,
        receivedCommentsCount: true,
        givenLikesCount: true,
        givenCommentsCount: true,
        starlight: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: '用户不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: { user } });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
