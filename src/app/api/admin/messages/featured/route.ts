import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/messages/featured
 * 设置/取消留言精选状态
 * Body: { id: string, isFeatured: boolean }
 */
export async function PUT(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, isFeatured } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: '请提供有效的留言 id' }, { status: 400 });
    }

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json({ error: 'isFeatured 必须为布尔值' }, { status: 400 });
    }

    const updated = await prisma.guestbook.update({
      where: { id },
      data: { isFeatured },
      select: { id: true, isFeatured: true },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
