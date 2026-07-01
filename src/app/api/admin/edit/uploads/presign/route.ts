import { NextRequest, NextResponse } from 'next/server';
import {
  ALLOWED_TYPES,
  SIZE_LIMITS,
  getPresignedAdminEditUploadUrl,
  getSizeCategory,
} from '@/lib/r2';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);
  if (!admin) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sessionId, uploadId, filename, mimeType, fileSize } = body as {
      sessionId?: string;
      uploadId?: string;
      filename?: string;
      mimeType?: string;
      fileSize?: number;
    };

    if (
      !sessionId ||
      typeof sessionId !== 'string' ||
      !filename ||
      typeof filename !== 'string' ||
      !mimeType ||
      typeof mimeType !== 'string'
    ) {
      return NextResponse.json(
        { error: 'sessionId、filename、mimeType 为必填字段' },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: `不支持的文件类型: ${mimeType}` }, { status: 400 });
    }

    if (fileSize !== undefined) {
      if (typeof fileSize !== 'number' || !Number.isFinite(fileSize) || fileSize <= 0) {
        return NextResponse.json({ error: '无效的 fileSize' }, { status: 400 });
      }

      const category = getSizeCategory(mimeType);
      const maxSize = SIZE_LIMITS[category];
      if (fileSize > maxSize) {
        const maxMB = Math.round(maxSize / 1024 / 1024);
        return NextResponse.json({ error: `文件大小超出限制（最大 ${maxMB}MB）` }, { status: 400 });
      }
    }

    const resolvedUploadId =
      typeof uploadId === 'string' && uploadId ? uploadId : crypto.randomUUID();
    const result = await getPresignedAdminEditUploadUrl(
      sessionId,
      resolvedUploadId,
      filename,
      mimeType,
    );

    return NextResponse.json({
      success: true,
      uploadId: resolvedUploadId,
      tempKey: result.key,
      publicTempUrl: result.publicUrl,
      key: result.key,
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    console.error('[Admin Edit Upload Presign] Error:', error);
    return NextResponse.json({ error: '生成临时上传链接失败' }, { status: 500 });
  }
}
