import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - 点赞 +1
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const existing = await prisma.guestbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: { message: '留言不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    const updated = await prisma.guestbook.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
      select: { id: true, likesCount: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('点赞失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
