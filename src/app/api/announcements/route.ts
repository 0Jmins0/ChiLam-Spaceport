import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { AnnouncementType } from '@/generated/prisma/client';
import { getAnnouncements } from '@/lib/queries/announcements';
import type { AnnouncementTab } from '@/lib/types';

const validTypes = new Set<string>(['notice', 'rule', 'update']);

const tabToEnum: Record<AnnouncementTab, AnnouncementType> = {
  notice: AnnouncementType.NOTICE,
  rule: AnnouncementType.RULE,
  update: AnnouncementType.UPDATE,
};

// GET - 公告列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 20, 50);

    const data = await getAnnouncements({
      type: validTypes.has(type || '') ? (type as AnnouncementTab) : undefined,
      page,
      pageSize,
    });

    return NextResponse.json({
      data: data.items,
      pagination: {
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalCount: data.totalCount,
        hasMore: data.hasMore,
      },
    });
  } catch (error) {
    console.error('获取公告列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}

// POST - 创建公告
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 必填字段验证
    if (!body.title || !body.content || !body.type) {
      return NextResponse.json(
        {
          error: {
            message: '缺少必填字段: title, content, type',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    if (!validTypes.has(body.type)) {
      return NextResponse.json(
        {
          error: {
            message: 'type 必须为 notice / rule / update',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 },
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: body.title,
        content: body.content,
        type: tabToEnum[body.type as AnnouncementTab],
        isPinned: body.isPinned ?? false,
        publishDate: body.publishDate ? new Date(body.publishDate) : new Date(),
      },
    });

    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (error) {
    console.error('创建公告失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
