import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUser } from '@/lib/auth';
import { getUserProfile } from '@/lib/queries/user';

// GET - 获取当前用户完整信息
export async function GET(request: NextRequest) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: { message: '请先登录', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const user = await getUserProfile(userPayload.userId);
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

// PUT - 修改个人信息
export async function PUT(request: NextRequest) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: { message: '请先登录', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    let displayNameChanged = false;
    let newDisplayName = '';

    // displayName 校验
    if (body.displayName !== undefined) {
      const trimmed = String(body.displayName).trim();
      if (trimmed.length < 1 || trimmed.length > 20) {
        return NextResponse.json(
          { error: { message: '昵称长度需在 1-20 字之间', code: 'VALIDATION_ERROR' } },
          { status: 400 },
        );
      }
      updateData.displayName = trimmed;
      displayNameChanged = true;
      newDisplayName = trimmed;
    }

    // avatar 校验
    if (body.avatar !== undefined) {
      if (typeof body.avatar !== 'string' || !body.avatar.startsWith('http')) {
        return NextResponse.json(
          { error: { message: '头像必须是有效的 URL', code: 'VALIDATION_ERROR' } },
          { status: 400 },
        );
      }
      updateData.avatar = body.avatar;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: { message: '没有需要更新的字段', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: userPayload.userId },
      data: updateData,
      select: { id: true, username: true, displayName: true, avatar: true },
    });

    // 同步更新留言中的昵称
    if (displayNameChanged) {
      await prisma.guestbook.updateMany({
        where: { userId: userPayload.userId },
        data: { nickname: newDisplayName },
      });
    }

    return NextResponse.json({ data: { user: updated } });
  } catch (error) {
    console.error('修改个人信息失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
