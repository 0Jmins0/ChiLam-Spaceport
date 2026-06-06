import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/**
 * GET /api/admin/messages
 * 获取待审核留言列表，支持分页和状态筛选
 */
export async function GET(request: Request) {
  // 验证管理员身份
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '20')));
  const status = searchParams.get('status') || 'PENDING';

  // 验证 status 值
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: '无效的 status 参数' }, { status: 400 });
  }

  try {
    const where = { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' };

    const [messages, total] = await Promise.all([
      prisma.guestbook.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { images: true },
      }),
      prisma.guestbook.count({ where }),
    ]);

    return NextResponse.json({
      data: messages,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/messages
 * 批量审核留言
 * Body: { ids: string[], action: 'approve' | 'reject' }
 */
export async function PUT(request: Request) {
  // 验证管理员身份
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { ids, action } = body;

    // 参数校验
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '请提供有效的 ids 数组' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action 必须为 approve 或 reject' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const result = await prisma.guestbook.updateMany({
      where: { id: { in: ids } },
      data: { status: newStatus },
    });

    return NextResponse.json({
      data: { updated: result.count },
    });
  } catch {
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
