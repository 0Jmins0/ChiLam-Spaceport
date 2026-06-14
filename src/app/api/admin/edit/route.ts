export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

/** 可编辑字段白名单 */
const EDITABLE_FIELDS: Record<string, string[]> = {
  production: ['title', 'titleEn', 'synopsis', 'year', 'role', 'roleType', 'language', 'varietyRegion', 'varietyRole', 'posterId', 'releaseDate'],
  performance: ['title', 'titleEn', 'summary', 'year', 'venue', 'city', 'series', 'posterId', 'startDate'],
  endorsement: ['title', 'brand', 'category', 'description', 'role', 'startYear', 'endYear', 'startDate'],
  interview: [
    'title',
    'titleEn',
    'source',
    'host',
    'location',
    'duration',
    'summary',
    'embedUrl',
    'proofreadStatus',
    'date',
  ],
  album: ['title', 'titleEn', 'releaseYear', 'language', 'coverId', 'releaseDate'],
  magazine: ['title', 'issue', 'coverId'],
  livestream: [
    'title',
    'summary',
    'platform',
    'duration',
    'originalUrl',
    'replayUrl',
    'coverImageId',
  ],
};

/** 需要 parseInt 的整数字段 */
const INTEGER_FIELDS = new Set([
  'year',
  'startYear',
  'endYear',
  'releaseYear',
  'duration',
]);

/** 需要 Date 解析的字段 */
const DATE_FIELDS = new Set(['releaseDate', 'publishDate', 'date', 'startDate']);

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

/**
 * 将传入的 value 转换为对应字段的数据库类型
 */
function convertValue(field: string, value: string | number | null): unknown {
  if (value === null) return null;

  if (INTEGER_FIELDS.has(field)) {
    const parsed = parseInt(String(value), 10);
    if (isNaN(parsed)) throw new Error(`字段 "${field}" 需要整数值`);
    return parsed;
  }

  if (DATE_FIELDS.has(field)) {
    const date = new Date(String(value));
    if (isNaN(date.getTime())) throw new Error(`字段 "${field}" 需要有效的日期格式`);
    return date;
  }

  return String(value);
}

/**
 * PATCH /api/admin/edit
 * 通用字段编辑接口
 */
export async function PATCH(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { entityType, entityId, field, value } = body as {
      entityType: string;
      entityId: string;
      field: string;
      value: string | number | null;
    };

    // 验证 entityType
    const allowedFields = EDITABLE_FIELDS[entityType];
    if (!allowedFields) {
      return NextResponse.json(
        { error: `不支持的实体类型: ${entityType}` },
        { status: 400 },
      );
    }

    // 验证 field 在白名单中
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `字段 "${field}" 不允许编辑` },
        { status: 400 },
      );
    }

    // 验证 entityId
    if (!entityId || typeof entityId !== 'string') {
      return NextResponse.json({ error: '无效的 entityId' }, { status: 400 });
    }

    const model = getPrismaModel(entityType);

    // 查找实体
    const entity = await model.findUnique({ where: { id: entityId } });
    if (!entity) {
      return NextResponse.json(
        { error: `${entityType} #${entityId} 不存在` },
        { status: 404 },
      );
    }

    // 转换值
    let convertedValue: unknown;
    try {
      convertedValue = convertValue(field, value);
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 400 },
      );
    }

    // 读取旧值
    const oldValue = entity[field] ?? null;

    // 写入编辑历史
    await prisma.editHistory.create({
      data: {
        entityType,
        entityId,
        field,
        oldValue: oldValue === null ? null : JSON.stringify(oldValue),
        newValue: convertedValue === null ? null : JSON.stringify(convertedValue),
        editedBy: admin.adminId,
      },
    });

    // 更新实体
    const updated = await model.update({
      where: { id: entityId },
      data: { [field]: convertedValue },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error('[Admin Edit] Error:', err);
    return NextResponse.json(
      { error: '编辑失败，请稍后重试' },
      { status: 500 },
    );
  }
}
