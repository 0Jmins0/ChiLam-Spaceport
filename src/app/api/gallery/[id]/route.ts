import { NextRequest, NextResponse } from 'next/server';
import { getGalleryItemById } from '@/lib/queries/gallery';
import { verifyAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { deleteFile } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await getGalleryItemById(id);

    if (!item) {
      return NextResponse.json({ error: '媒体不存在' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Gallery item query error:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { id } = await params;
    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return NextResponse.json({ error: '媒体不存在' }, { status: 404 });
    }

    // 从 R2 删除文件
    try {
      const key = new URL(media.url).pathname.slice(1);
      await deleteFile(key);
    } catch (e) {
      console.error('R2 delete error (non-blocking):', e);
    }

    // 清理直接 FK 引用，然后删除 media 记录
    await prisma.$transaction([
      prisma.production.updateMany({
        where: { posterId: id },
        data: { posterId: null },
      }),
      prisma.performance.updateMany({
        where: { posterId: id },
        data: { posterId: null },
      }),
      prisma.album.updateMany({
        where: { coverId: id },
        data: { coverId: null },
      }),
      prisma.magazine.updateMany({
        where: { coverId: id },
        data: { coverId: null },
      }),
      prisma.interview.updateMany({
        where: { originalMediaId: id },
        data: { originalMediaId: null },
      }),
      prisma.livestream.updateMany({
        where: { coverImageId: id },
        data: { coverImageId: null },
      }),
      prisma.mediaCollection.updateMany({
        where: { coverId: id },
        data: { coverId: null },
      }),
      // 最后删除 media 记录（多对多关联会自动断开）
      prisma.media.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
