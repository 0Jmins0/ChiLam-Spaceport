import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { signUserToken } from '@/lib/auth';
import { isForbiddenUsername } from '@/lib/username-validator';

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

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      return NextResponse.json(
        { error: { message: '用户名长度需在 2-20 个字符之间', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: { message: '密码长度不能少于 6 个字符', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const forbidden = isForbiddenUsername(trimmedUsername);
    if (forbidden.forbidden) {
      return NextResponse.json(
        { error: { message: forbidden.reason, code: 'FORBIDDEN_USERNAME' } },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { username: trimmedUsername } });
    if (existing) {
      return NextResponse.json(
        { error: { message: '该用户名已被注册', code: 'USERNAME_TAKEN' } },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        password: hashedPassword,
      },
    });

    const token = await signUserToken({ userId: user.id, username: user.username });

    return NextResponse.json(
      {
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
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('注册失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
