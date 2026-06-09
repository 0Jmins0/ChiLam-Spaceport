import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/auth';
import { getUserMessages } from '@/lib/queries/user';

// GET - 获取当前登录用户的留言列表
export async function GET(request: NextRequest) {
  try {
    const userPayload = await verifyUser(request);
    if (!userPayload) {
      return NextResponse.json(
        { error: { message: '请先登录', code: 'UNAUTHORIZED' } },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Math.min(Number(searchParams.get('pageSize')) || 12, 50);

    const data = await getUserMessages(userPayload.userId, { page, pageSize });

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
    console.error('获取用户留言列表失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
