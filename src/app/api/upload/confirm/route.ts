import { NextRequest, NextResponse } from 'next/server';
import { ALLOWED_TYPES } from '@/lib/r2';
import { prisma } from '@/lib/db';
import { MediaType, MediaCategory } from '@/generated/prisma/client';
import { verifyAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
  return MediaType.FILE;
}

function getMediaCategory(mimeType: string): MediaCategory {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  return 'IMAGE';
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
  'interview:cover': { model: 'interview', fkField: 'coverImageId' },
  'livestream:cover': { model: 'livestream', fkField: 'coverImageId' },
  'endorsement:cover': { model: 'endorsement', fkField: 'coverImageId' },
};

const MANY_TO_MANY_MAP: Record<string, ManyToManyConfig> = {
  'production:gallery': { model: 'production', relationField: 'gallery' },
  'performance:gallery': { model: 'performance', relationField: 'gallery' },
  'socialPost:media': { model: 'socialPost', relationField: 'mediaItems' },
  'endorsement:media': { model: 'endorsement', relationField: 'media' },
  'sighting:media': { model: 'sighting', relationField: 'mediaItems' },
  'guestbook:images': { model: 'guestbook', relationField: 'images' },
  'magazine:scans': { model: 'magazine', relationField: 'scans' },
  'livestream:media': { model: 'livestream', relationField: 'media' },
  'newsArticle:media': { model: 'newsArticle', relationField: 'mediaItems' },
  'interview:gallery': { model: 'interview', relationField: 'gallery' },
};

async function findRecord(model: string, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any)[model];
  if (!delegate) return null;
  return delegate.findUnique({ where: { id } });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      key,
      url,
      filename,
      mimeType,
      size,
      target,
      targetId,
      relation,
      alt,
      caption,
      mediaTag,
      thumbnailUrl,
      width,
      height,
      duration,
    } = body;

    if (!key || !url || !filename || !mimeType || typeof size !== 'number') {
      return NextResponse.json(
        { error: 'key、url、filename、mimeType、size 为必填字段' },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: `不支持的文件类型: ${mimeType}` }, { status: 400 });
    }

    const wantsBind = target || targetId || relation;
    if (wantsBind && (!target || !targetId || !relation)) {
      return NextResponse.json(
        { error: 'target、targetId、relation 必须同时提供' },
        { status: 400 },
      );
    }

    if (wantsBind) {
      const admin = await verifyAdmin(request);
      if (!admin) {
        return NextResponse.json({ error: '未授权访问' }, { status: 401 });
      }
    }

    const bindKey = `${target}:${relation}`;
    const directConfig = target ? DIRECT_FK_MAP[bindKey] : null;
    const m2mConfig = target ? MANY_TO_MANY_MAP[bindKey] : null;

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

    if (!wantsBind) {
      const media = await prisma.media.create({
        data: {
          type: getMediaType(mimeType),
          category: getMediaCategory(mimeType),
          mediaTag: mediaTag || undefined,
          url,
          filename,
          mimeType,
          size,
          thumbnailUrl: thumbnailUrl || undefined,
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
          duration: typeof duration === 'number' ? duration : undefined,
          alt: alt || undefined,
          caption: caption || undefined,
        },
      });

      return NextResponse.json({
        success: true,
        key,
        url,
        media,
      });
    }

    const media = await prisma.$transaction(async (tx) => {
      const created = await tx.media.create({
        data: {
          type: getMediaType(mimeType),
          category: getMediaCategory(mimeType),
          mediaTag: mediaTag || undefined,
          url,
          filename,
          mimeType,
          size,
          thumbnailUrl: thumbnailUrl || undefined,
          width: typeof width === 'number' ? width : undefined,
          height: typeof height === 'number' ? height : undefined,
          duration: typeof duration === 'number' ? duration : undefined,
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
      key,
      url,
      media,
    });
  } catch (error) {
    console.error('Upload confirm error:', error);
    return NextResponse.json({ error: '确认上传失败' }, { status: 500 });
  }
}
