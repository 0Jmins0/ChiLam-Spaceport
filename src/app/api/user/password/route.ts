import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// PUT - 修改密码
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

    if (!body.oldPassword || !body.newPassword) {
      return NextResponse.json(
        { error: { message: '旧密码和新密码为必填项', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: { message: '用户不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    const isMatch = await bcrypt.compare(body.oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: { message: '旧密码不正确', code: 'INVALID_PASSWORD' } },
        { status: 400 },
      );
    }

    if (String(body.newPassword).length < 6) {
      return NextResponse.json(
        { error: { message: '新密码长度至少 6 位', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('修改密码失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
