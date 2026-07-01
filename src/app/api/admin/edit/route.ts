export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import {
  assertEditableField,
  convertEditableValue,
  getEditableFields,
  getEditableModel,
} from '@/lib/admin-edit-config';

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
      value: string | number | boolean | null;
    };

    // 验证 entityType
    const allowedFields = getEditableFields(entityType);
    if (!allowedFields) {
      return NextResponse.json({ error: `不支持的实体类型: ${entityType}` }, { status: 400 });
    }

    // 验证 field 在白名单中
    try {
      assertEditableField(entityType, field);
    } catch (error) {
      return NextResponse.json({ error: (error as Error).message }, { status: 400 });
    }

    // 验证 entityId
    if (!entityId || typeof entityId !== 'string') {
      return NextResponse.json({ error: '无效的 entityId' }, { status: 400 });
    }

    const model = getEditableModel(entityType);

    // 查找实体
    const entity = await model.findUnique({ where: { id: entityId } });
    if (!entity) {
      return NextResponse.json({ error: `${entityType} #${entityId} 不存在` }, { status: 404 });
    }

    // 转换值
    let convertedValue: unknown;
    try {
      convertedValue = convertEditableValue(field, value);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
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
    return NextResponse.json({ error: '编辑失败，请稍后重试' }, { status: 500 });
  }
}
