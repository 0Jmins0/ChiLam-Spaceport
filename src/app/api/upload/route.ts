import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, ALLOWED_TYPES, SIZE_LIMITS, getSizeCategory } from '@/lib/r2';
import { prisma } from '@/lib/db';
import { MediaType } from '@/generated/prisma/client';

export const dynamic = 'force-dynamic';

function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
  return MediaType.FILE;
}

type DirectFKConfig = {
  model: string;
  fkField: string;
};

type ManyToManyConfig = {
  model: string;
  relationField: string;
};

const DIRECT_FK_MAP: Record<string, DirectFKConfig> = {
  'production:poster': { model: 'production', fkField: 'posterId' },
  'performance:poster': { model: 'performance', fkField: 'posterId' },
  'album:cover': { model: 'album', fkField: 'coverId' },
  'magazine:cover': { model: 'magazine', fkField: 'coverId' },
  'interview:media': { model: 'interview', fkField: 'originalMediaId' },
  'livestream:cover': { model: 'livestream', fkField: 'coverImageId' },
};

const MANY_TO_MANY_MAP: Record<string, ManyToManyConfig> = {
  'production:gallery': { model: 'production', relationField: 'gallery' },
  'socialPost:media': { model: 'socialPost', relationField: 'mediaItems' },
  'endorsement:media': { model: 'endorsement', relationField: 'media' },
  'sighting:media': { model: 'sighting', relationField: 'mediaItems' },
  'guestbook:images': { model: 'guestbook', relationField: 'images' },
  'magazine:scans': { model: 'magazine', relationField: 'scans' },
  'livestream:media': { model: 'livestream', relationField: 'media' },
  'newsArticle:media': { model: 'newsArticle', relationField: 'mediaItems' },
};

async function findRecord(model: string, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any)[model];
  if (!delegate) return null;
  return delegate.findUnique({ where: { id } });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const target = formData.get('target') as string | null;
    const targetId = formData.get('targetId') as string | null;
    const relation = formData.get('relation') as string | null;
    const alt = formData.get('alt') as string | null;
    const caption = formData.get('caption') as string | null;

    if (!file) {
      return NextResponse.json({ error: '未提供文件' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `不支持的文件类型: ${file.type}` }, { status: 400 });
    }

    const category = getSizeCategory(file.type);
    const maxSize = SIZE_LIMITS[category];
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / 1024 / 1024);
      return NextResponse.json({ error: `文件大小超出限制（最大 ${maxMB}MB）` }, { status: 400 });
    }

    const wantsBind = target || targetId || relation;
    if (wantsBind && (!target || !targetId || !relation)) {
      return NextResponse.json(
        { error: 'target、targetId、relation 必须同时提供' },
        { status: 400 },
      );
    }

    const key = `${target}:${relation}`;
    const directConfig = target ? DIRECT_FK_MAP[key] : null;
    const m2mConfig = target ? MANY_TO_MANY_MAP[key] : null;

    if (wantsBind && !directConfig && !m2mConfig) {
      return NextResponse.json(
        { error: `不支持的 target + relation 组合: ${target}:${relation}` },
        { status: 400 },
      );
    }

    const modelName = directConfig?.model ?? m2mConfig?.model;
    if (wantsBind && modelName) {
      const record = await findRecord(modelName, targetId!);
      if (!record) {
        return NextResponse.json(
          { error: `${target} 记录不存在（id: ${targetId}）` },
          { status: 404 },
        );
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile(buffer, file.name, file.type);

    if (!wantsBind) {
      return NextResponse.json({
        success: true,
        key: result.key,
        url: result.url,
      });
    }

    const media = await prisma.$transaction(async (tx) => {
      const created = await tx.media.create({
        data: {
          type: getMediaType(file.type),
          url: result.url,
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          alt: alt || undefined,
          caption: caption || undefined,
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delegate = (tx as any)[modelName!];

      if (directConfig) {
        await delegate.update({
          where: { id: targetId },
          data: { [directConfig.fkField]: created.id },
        });
      } else if (m2mConfig) {
        await delegate.update({
          where: { id: targetId },
          data: {
            [m2mConfig.relationField]: {
              connect: { id: created.id },
            },
          },
        });
      }

      return created;
    });

    return NextResponse.json({
      success: true,
      key: result.key,
      url: result.url,
      media,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
