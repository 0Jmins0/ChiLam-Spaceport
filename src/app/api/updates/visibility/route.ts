import { NextResponse } from 'next/server';
import { getUpdateCategoryStates } from '@/lib/queries/updates';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getUpdateCategoryStates();
    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('获取动态开关状态失败:', error);
    return NextResponse.json(
      { error: { message: '服务器错误', code: 'INTERNAL_ERROR' } },
      { status: 500 },
    );
  }
}
