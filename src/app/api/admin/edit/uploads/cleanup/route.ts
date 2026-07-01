import { NextRequest, NextResponse } from 'next/server';
import { deleteFiles, isAdminEditTempKey } from '@/lib/r2';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, tempKeys, tempUploads } = body as {
      sessionId?: string;
      tempKeys?: string[];
      tempUploads?: Array<{ tempKey?: string; key?: string }>;
    };

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: '无效的 sessionId' }, { status: 400 });
    }

    const keys =
      tempKeys ??
      tempUploads
        ?.map((upload) => upload.tempKey ?? upload.key)
        .filter((key): key is string => Boolean(key));

    if (!Array.isArray(keys)) {
      return NextResponse.json({ error: 'tempKeys 或 tempUploads 必须是数组' }, { status: 400 });
    }

    const hasInvalidKey = keys.some(
      (key) => typeof key !== 'string' || !isAdminEditTempKey(key, sessionId),
    );
    if (hasInvalidKey) {
      return NextResponse.json(
        { error: 'tempKeys 包含不属于当前 session 的临时文件' },
        { status: 400 },
      );
    }

    await deleteFiles(keys);

    return NextResponse.json({
      success: true,
      deleted: keys.length,
    });
  } catch (error) {
    console.error('[Admin Edit Upload Cleanup] Error:', error);
    return NextResponse.json({ error: '清理临时上传失败' }, { status: 500 });
  }
}
