import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signUserToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username?.trim() || !password) {
      return NextResponse.json(
        { error: { message: '用户名和密码为必填项', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (!user) {
      return NextResponse.json(
        { error: { message: '用户名或密码错误', code: 'INVALID_CREDENTIALS' } },
        { status: 401 },
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: { message: '账号已被禁用', code: 'ACCOUNT_DISABLED' } },
        { status: 403 },
      );
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: { message: '用户名或密码错误', code: 'INVALID_CREDENTIALS' } },
        { status: 401 },
      );
    }

    const token = await signUserToken({ userId: user.id, username: user.username });

    return NextResponse.json({
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
