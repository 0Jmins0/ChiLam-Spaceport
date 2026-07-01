import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';
import {
  contentExists,
  hydrateRelationSources,
  hydrateRelationTargets,
} from '@/lib/content-relations';
import { isAllowedContentType } from '@/lib/content-types';

export const dynamic = 'force-dynamic';

const allowedRelationTypes = new Set(['about', 'sighting_of', 'promotion_of', 'stage_of', 'related']);

export async function GET(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sourceType = searchParams.get('sourceType');
  const sourceId = searchParams.get('sourceId');
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');

  if (sourceType && sourceId) {
    const relations = await prisma.contentRelation.findMany({
      where: { sourceType, sourceId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    const related = await hydrateRelationTargets(relations);
    return NextResponse.json({ data: related });
  }

  if (targetType && targetId) {
    const relations = await prisma.contentRelation.findMany({
      where: { targetType, targetId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    const related = await hydrateRelationSources(relations);
    return NextResponse.json({ data: related });
  }

  return NextResponse.json({ error: '缺少 source 或 target 参数' }, { status: 400 });
}

export async function POST(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { sourceType, sourceId, targetType, targetId, relationType = 'related', note } = body ?? {};

  if (
    !isAllowedContentType(sourceType) ||
    !isAllowedContentType(targetType) ||
    typeof sourceId !== 'string' ||
    typeof targetId !== 'string' ||
    !allowedRelationTypes.has(relationType)
  ) {
    return NextResponse.json({ error: '关联参数无效' }, { status: 400 });
  }

  const [sourceOk, targetOk] = await Promise.all([
    contentExists(sourceType, sourceId),
    contentExists(targetType, targetId),
  ]);

  if (!sourceOk || !targetOk) {
    return NextResponse.json({ error: '关联源或目标不存在' }, { status: 404 });
  }

  const existing = await prisma.contentRelation.findFirst({
    where: { sourceType, sourceId, targetType, targetId, relationType },
  });
  if (existing) return NextResponse.json({ data: existing }, { status: 200 });

  const relation = await prisma.contentRelation.create({
    data: {
      sourceType,
      sourceId,
      targetType,
      targetId,
      relationType,
      note: typeof note === 'string' && note.trim() ? note.trim() : undefined,
    },
  });

  return NextResponse.json({ data: relation }, { status: 201 });
}

export async function DELETE(request: Request) {
  const admin = await verifyAdmin(request);
  if (!admin) return NextResponse.json({ error: '未授权访问' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== 'string') {
    return NextResponse.json({ error: 'id 无效' }, { status: 400 });
  }

  await prisma.contentRelation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
