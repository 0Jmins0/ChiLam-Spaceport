import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST - 创建关联
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { productionId } = await request.json();

    if (!productionId) {
      return NextResponse.json(
        { error: { message: 'productionId 为必填', code: 'VALIDATION_ERROR' } },
        { status: 400 },
      );
    }

    const performance = await prisma.performance.findUnique({ where: { slug } });
    if (!performance) {
      return NextResponse.json(
        { error: { message: '演出不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    const production = await prisma.production.findUnique({ where: { id: productionId } });
    if (!production) {
      return NextResponse.json(
        { error: { message: '综艺不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    // 检查是否已关联
    const existing = await prisma.contentRelation.findFirst({
      where: {
        sourceType: 'performance',
        sourceId: performance.id,
        targetType: 'production',
        targetId: productionId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: { message: '已关联', code: 'CONFLICT' } }, { status: 409 });
    }

    const relation = await prisma.contentRelation.create({
      data: {
        sourceType: 'performance',
        sourceId: performance.id,
        targetType: 'production',
        targetId: productionId,
        relationType: 'stage_of',
      },
    });

    return NextResponse.json({ data: relation }, { status: 201 });
  } catch (error) {
    console.error('创建演出关联失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// DELETE - 解除关联
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { productionId } = await request.json();

    const performance = await prisma.performance.findUnique({ where: { slug } });
    if (!performance) {
      return NextResponse.json(
        { error: { message: '演出不存在', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    await prisma.contentRelation.deleteMany({
      where: {
        sourceType: 'performance',
        sourceId: performance.id,
        targetType: 'production',
        targetId: productionId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('解除演出关联失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
