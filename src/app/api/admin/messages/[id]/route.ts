import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/**
 * PUT /api/admin/messages/[id]
 * 单条留言审核
 * Body: { action: 'approve' | 'reject' }
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 验证管理员身份
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action } = body;

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action 必须为 approve 或 reject' }, { status: 400 });
    }

    // 检查留言是否存在
    const existing = await prisma.guestbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '留言不存在' }, { status: 404 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const updated = await prisma.guestbook.update({
      where: { id },
      data: { status: newStatus },
    });

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/messages/[id]
 * 彻底删除单条留言
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 验证管理员身份
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // 检查留言是否存在
    const existing = await prisma.guestbook.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: '留言不存在' }, { status: 404 });
    }

    await prisma.guestbook.delete({ where: { id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
