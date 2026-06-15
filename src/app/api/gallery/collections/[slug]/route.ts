import { NextRequest, NextResponse } from 'next/server';
import { getCollectionBySlug } from '@/lib/queries/gallery';
import { verifyAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const collection = await getCollectionBySlug(slug);

    if (!collection) {
      return NextResponse.json({ error: '相册集不存在' }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error('Collection detail error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const {
      title,
      description,
      date,
      coverId,
      relatedType,
      relatedId,
      addMediaIds,
      removeMediaIds,
    } = body;

    const existing = await prisma.mediaCollection.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: '相册集不存在' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date ? new Date(date) : null;
    if (coverId !== undefined) updateData.coverId = coverId;
    if (relatedType !== undefined) updateData.relatedType = relatedType;
    if (relatedId !== undefined) updateData.relatedId = relatedId;

    if (addMediaIds?.length || removeMediaIds?.length) {
      updateData.items = {};
      if (addMediaIds?.length) {
        updateData.items.connect = addMediaIds.map((id: string) => ({ id }));
      }
      if (removeMediaIds?.length) {
        updateData.items.disconnect = removeMediaIds.map((id: string) => ({ id }));
      }
    }

    const updated = await prisma.mediaCollection.update({
      where: { slug },
      data: updateData,
      include: {
        cover: { select: { url: true } },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Collection update error:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { slug } = await params;

    const existing = await prisma.mediaCollection.findUnique({ where: { slug } });
    if (!existing) {
      return NextResponse.json({ error: '相册集不存在' }, { status: 404 });
    }

    await prisma.mediaCollection.delete({ where: { slug } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Collection delete error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
