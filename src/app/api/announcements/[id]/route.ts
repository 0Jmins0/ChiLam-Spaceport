import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AnnouncementType } from '@/generated/prisma/client';
import { getAnnouncementById } from '@/lib/queries/announcements';
import type { AnnouncementTab } from '@/lib/types';
import { verifyAdmin } from '@/lib/auth';

const tabToEnum: Record<AnnouncementTab, AnnouncementType> = {
  notice: AnnouncementType.NOTICE,
  rule: AnnouncementType.RULE,
  update: AnnouncementType.UPDATE,
};

// GET - 获取单条公告详情
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const announcement = await getAnnouncementById(id);

    if (!announcement) {
      return NextResponse.json(
        { error: { message: '未找到', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: announcement });
  } catch (error) {
    console.error('获取公告详情失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// PUT - 更新公告
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: { message: '未授权', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) data.title = body.title;
    if (body.content !== undefined) data.content = body.content;
    if (body.isPinned !== undefined) data.isPinned = body.isPinned;
    if (body.publishDate !== undefined) data.publishDate = new Date(body.publishDate);
    if (body.type !== undefined && body.type in tabToEnum) {
      data.type = tabToEnum[body.type as AnnouncementTab];
    }

    const result = await prisma.announcement.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: { message: '未找到', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    console.error('更新公告失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// DELETE - 删除公告
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: { message: '未授权', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const { id } = await params;

    await prisma.announcement.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { error: { message: '未找到', code: 'NOT_FOUND' } },
        { status: 404 },
      );
    }

    console.error('删除公告失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
