import { NextRequest, NextResponse } from 'next/server';
import { getPresignedUploadUrl, ALLOWED_TYPES, SIZE_LIMITS, getSizeCategory } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, mimeType, fileSize } = body;

    if (!filename || !mimeType) {
      return NextResponse.json({ error: '请提供 filename 和 mimeType' }, { status: 400 });
    }

    // 类型校验
    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: `不支持的文件类型: ${mimeType}` }, { status: 400 });
    }

    // 大小校验（如果提供了 fileSize）
    if (fileSize) {
      const category = getSizeCategory(mimeType);
      const maxSize = SIZE_LIMITS[category];
      if (fileSize > maxSize) {
        const maxMB = Math.round(maxSize / 1024 / 1024);
        return NextResponse.json({ error: `文件大小超出限制（最大 ${maxMB}MB）` }, { status: 400 });
      }
    }

    const result = await getPresignedUploadUrl(filename, mimeType);

    return NextResponse.json({
      success: true,
      key: result.key,
      uploadUrl: result.uploadUrl,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    console.error('Presign error:', error);
    return NextResponse.json({ error: '生成上传链接失败' }, { status: 500 });
  }
}
