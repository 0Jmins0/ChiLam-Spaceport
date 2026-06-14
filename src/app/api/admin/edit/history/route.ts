export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/** 允许的 entityType 列表 */
const ALLOWED_ENTITY_TYPES = [
  'production',
  'performance',
  'endorsement',
  'interview',
  'album',
  'magazine',
  'livestream',
];

/**
 * GET /api/admin/edit/history?entityType=production&entityId=123&field=title
 * 查询指定实体字段是否有可撤销的编辑历史
 */
export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get('entityType');
    const entityIdStr = searchParams.get('entityId');
    const field = searchParams.get('field');

    // 验证参数
    if (!entityType || !ALLOWED_ENTITY_TYPES.includes(entityType)) {
      return NextResponse.json(
        { error: '无效的 entityType 参数' },
        { status: 400 },
      );
    }

    if (!entityIdStr) {
      return NextResponse.json(
        { error: '缺少 entityId 参数' },
        { status: 400 },
      );
    }

    const entityId = entityIdStr;

    if (!field) {
      return NextResponse.json(
        { error: '缺少 field 参数' },
        { status: 400 },
      );
    }

    // 查找最近一条编辑历史
    const lastEdit = await prisma.editHistory.findFirst({
      where: { entityType, entityId, field },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastEdit) {
      return NextResponse.json({ hasHistory: false });
    }

    return NextResponse.json({
      hasHistory: true,
      lastEdit: {
        oldValue: lastEdit.oldValue,
        newValue: lastEdit.newValue,
        editedBy: lastEdit.editedBy,
        createdAt: lastEdit.createdAt,
      },
    });
  } catch (err) {
    console.error('[Admin Edit History] Error:', err);
    return NextResponse.json(
      { error: '查询编辑历史失败' },
      { status: 500 },
    );
  }
}
