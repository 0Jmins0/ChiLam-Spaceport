export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/** 需要 parseInt 的整数字段 */
const INTEGER_FIELDS = new Set([
  'year',
  'startYear',
  'endYear',
  'releaseYear',
  'duration',
]);

/** 需要 Date 解析的字段 */
const DATE_FIELDS = new Set(['releaseDate', 'publishDate']);

/** entityType → Prisma model accessor */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPrismaModel(entityType: string): any {
  const models: Record<string, unknown> = {
    production: prisma.production,
    performance: prisma.performance,
    endorsement: prisma.endorsement,
    interview: prisma.interview,
    album: prisma.album,
    magazine: prisma.magazine,
    livestream: prisma.livestream,
  };
  return models[entityType] || null;
}

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
 * 将 JSON 字符串恢复为对应字段的数据库类型
 */
function restoreValue(field: string, jsonValue: string | null): unknown {
  if (jsonValue === null) return null;

  const parsed = JSON.parse(jsonValue);
  if (parsed === null) return null;

  if (INTEGER_FIELDS.has(field)) {
    return typeof parsed === 'number' ? parsed : parseInt(String(parsed), 10);
  }

  if (DATE_FIELDS.has(field)) {
    return new Date(parsed);
  }

  return String(parsed);
}

/**
 * POST /api/admin/edit/undo
 * 撤销指定实体字段的最近一次编辑
 */
export async function POST(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { entityType, entityId, field } = body as {
      entityType: string;
      entityId: string;
      field: string;
    };

    // 验证参数
    if (!ALLOWED_ENTITY_TYPES.includes(entityType)) {
      return NextResponse.json(
        { error: `不支持的实体类型: ${entityType}` },
        { status: 400 },
      );
    }

    if (!entityId || typeof entityId !== 'string') {
      return NextResponse.json({ error: '无效的 entityId' }, { status: 400 });
    }

    if (!field || typeof field !== 'string') {
      return NextResponse.json({ error: '无效的 field' }, { status: 400 });
    }

    // 查找最近一条编辑历史
    const history = await prisma.editHistory.findFirst({
      where: { entityType, entityId, field },
      orderBy: { createdAt: 'desc' },
    });

    if (!history) {
      return NextResponse.json(
        { error: '无可撤销的编辑' },
        { status: 404 },
      );
    }

    const model = getPrismaModel(entityType);
    if (!model) {
      return NextResponse.json(
        { error: `不支持的实体类型: ${entityType}` },
        { status: 400 },
      );
    }

    // 确认实体存在
    const entity = await model.findUnique({ where: { id: entityId } });
    if (!entity) {
      return NextResponse.json(
        { error: `${entityType} #${entityId} 不存在` },
        { status: 404 },
      );
    }

    // 恢复旧值
    const restoredValue = restoreValue(field, history.oldValue);

    // 更新实体
    const updated = await model.update({
      where: { id: entityId },
      data: { [field]: restoredValue },
    });

    // 删除这条编辑历史
    await prisma.editHistory.delete({ where: { id: history.id } });

    return NextResponse.json({
      success: true,
      data: updated,
      restoredValue,
    });
  } catch (err) {
    console.error('[Admin Edit Undo] Error:', err);
    return NextResponse.json(
      { error: '撤销失败，请稍后重试' },
      { status: 500 },
    );
  }
}
