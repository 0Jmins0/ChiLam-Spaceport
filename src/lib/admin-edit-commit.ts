import { prisma } from '@/lib/db';
import {
  ALLOWED_TYPES,
  SIZE_LIMITS,
  copyFile,
  deleteFiles,
  generateFinalKey,
  getSizeCategory,
  isAdminEditTempKey,
} from '@/lib/r2';
import type { AdminPayload } from '@/lib/auth';
import { MediaCategory, MediaType, Prisma } from '@/generated/prisma/client';
import { cleanupUnreferencedMedia } from '@/lib/media-cleanup';

type FieldValue = string | number | boolean | null;

export type PendingField = {
  entityType: string;
  entityId: string;
  field: string;
  value: FieldValue;
};

type UploadMetadata = {
  uploadId?: string;
  tempKey: string;
  filename: string;
  mimeType: string;
  size: number;
  alt?: string | null;
  caption?: string | null;
  mediaTag?: string | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

export type PendingUpload = UploadMetadata & {
  target: string;
  targetId: string;
  relation: string;
};

export type PendingRemoval = {
  target: string;
  targetId: string;
  relation: string;
  mediaId?: string | null;
};

export type PendingReplacement = {
  target: string;
  targetId: string;
  relation: string;
  mediaId?: string | null;
  upload?: UploadMetadata | null;
  uploadId?: string;
  tempKey?: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  alt?: string | null;
  caption?: string | null;
  mediaTag?: string | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

export type PendingEntryDelete = {
  entityType: string;
  entityId: string;
};

export type AdminEditCommitPayload = {
  sessionId: string;
  pendingFields?: PendingField[];
  pendingUploads?: PendingUpload[];
  pendingRemovals?: PendingRemoval[];
  pendingReplacements?: PendingReplacement[];
  pendingEntryDeletes?: PendingEntryDelete[];
};

type DirectFKConfig = {
  model: string;
  fkField: string;
};

type ManyToManyConfig = {
  model: string;
  relationField: string;
};

type NormalizedUpload = UploadMetadata & {
  target: string;
  targetId: string;
  relation: string;
};

type CopiedUpload = {
  upload: NormalizedUpload;
  finalKey: string;
  finalUrl: string;
};

type CopiedReplacement = {
  replacement: PendingReplacement;
  upload?: NormalizedUpload;
  copied?: CopiedUpload;
};

type CommitSummary = {
  fieldsUpdated: number;
  uploadsAdded: number;
  relationsRemoved: number;
  directReplacements: number;
  entryDeletesSkipped: number;
  tempFilesCleaned: number;
  tempCleanupFailed: number;
};

export class AdminEditCommitError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AdminEditCommitError';
    this.status = status;
  }
}

/** 可编辑字段白名单，与 /api/admin/edit 保持一致 */
const EDITABLE_FIELDS: Record<string, string[]> = {
  production: [
    'title',
    'titleEn',
    'synopsis',
    'year',
    'role',
    'roleType',
    'language',
    'varietyRegion',
    'varietyRole',
    'posterId',
    'releaseDate',
  ],
  performance: [
    'title',
    'titleEn',
    'summary',
    'year',
    'venue',
    'city',
    'series',
    'posterId',
    'startDate',
  ],
  endorsement: [
    'title',
    'brand',
    'category',
    'description',
    'role',
    'startYear',
    'endYear',
    'startDate',
    'coverImageId',
  ],
  interview: [
    'title',
    'titleEn',
    'source',
    'host',
    'location',
    'duration',
    'summary',
    'embedUrl',
    'proofreadStatus',
    'date',
    'coverImageId',
  ],
  album: ['title', 'titleEn', 'releaseYear', 'language', 'coverId', 'releaseDate'],
  magazine: ['title', 'issue', 'coverId'],
  livestream: [
    'title',
    'summary',
    'platform',
    'duration',
    'originalUrl',
    'replayUrl',
    'coverImageId',
  ],
  socialPost: [
    'platform',
    'originalUrl',
    'originalId',
    'title',
    'summary',
    'thumbnailUrl',
    'publishedAt',
    'contentText',
    'isFullCopy',
    'isVisible',
  ],
  newsArticle: [
    'title',
    'source',
    'originalUrl',
    'summary',
    'thumbnailUrl',
    'publishedAt',
    'contentText',
    'isFullCopy',
    'isVisible',
  ],
  sighting: [
    'title',
    'summary',
    'thumbnailUrl',
    'sightedAt',
    'authorName',
    'originalUrl',
    'content',
    'isFullCopy',
    'isVisible',
  ],
  media: [
    'caption',
    'alt',
    'mediaTag',
    'searchNote',
    'thumbnailUrl',
    'width',
    'height',
    'duration',
  ],
  mediaCollection: ['title', 'description', 'coverId'],
};

const INTEGER_FIELDS = new Set(['year', 'startYear', 'endYear', 'releaseYear']);
const NUMBER_FIELDS = new Set(['width', 'height', 'duration']);
const DATE_FIELDS = new Set([
  'releaseDate',
  'publishDate',
  'date',
  'startDate',
  'publishedAt',
  'sightedAt',
]);
const BOOLEAN_FIELDS = new Set(['isFullCopy', 'isVisible']);

const ENTITY_MODEL_MAP: Record<string, string> = {
  production: 'production',
  performance: 'performance',
  endorsement: 'endorsement',
  interview: 'interview',
  album: 'album',
  magazine: 'magazine',
  livestream: 'livestream',
  socialPost: 'socialPost',
  newsArticle: 'newsArticle',
  sighting: 'sighting',
  media: 'media',
  mediaCollection: 'mediaCollection',
};

const ENTITY_CONTENT_TYPE_MAP: Record<string, string> = {
  production: 'production',
  performance: 'performance',
  endorsement: 'endorsement',
  interview: 'interview',
  album: 'album',
  magazine: 'magazine',
  livestream: 'livestream',
  socialPost: 'social_post',
  newsArticle: 'news_article',
  sighting: 'sighting',
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
  'mediaCollection:cover': { model: 'mediaCollection', fkField: 'coverId' },
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
  'mediaCollection:items': { model: 'mediaCollection', relationField: 'items' },
};

function convertValue(field: string, value: FieldValue): unknown {
  if (value === null) return null;

  if (INTEGER_FIELDS.has(field)) {
    const parsed = parseInt(String(value), 10);
    if (isNaN(parsed)) throw new AdminEditCommitError(`字段 "${field}" 需要整数值`);
    return parsed;
  }

  if (NUMBER_FIELDS.has(field)) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new AdminEditCommitError(`字段 "${field}" 需要数字值`);
    return parsed;
  }

  if (DATE_FIELDS.has(field)) {
    const date = new Date(String(value));
    if (isNaN(date.getTime())) throw new AdminEditCommitError(`字段 "${field}" 需要有效的日期格式`);
    return date;
  }

  if (BOOLEAN_FIELDS.has(field)) {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new AdminEditCommitError(`字段 "${field}" 需要布尔值`);
  }

  return String(value);
}

function getMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith('image/')) return MediaType.IMAGE;
  if (mimeType.startsWith('video/')) return MediaType.VIDEO;
  if (mimeType.startsWith('audio/')) return MediaType.AUDIO;
  return MediaType.FILE;
}

function getMediaCategory(mimeType: string): MediaCategory {
  if (mimeType.startsWith('image/')) return MediaCategory.IMAGE;
  if (mimeType.startsWith('video/')) return MediaCategory.VIDEO;
  if (mimeType.startsWith('audio/')) return MediaCategory.AUDIO;
  return MediaCategory.IMAGE;
}

function assertString(value: unknown, name: string): asserts value is string {
  if (!value || typeof value !== 'string') {
    throw new AdminEditCommitError(`无效的 ${name}`);
  }
}

function assertArray<T>(value: T[] | undefined, name: string): T[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new AdminEditCommitError(`${name} 必须是数组`);
  return value;
}

function validateUploadMetadata(upload: UploadMetadata, sessionId: string): void {
  assertString(upload.tempKey, 'tempKey');
  assertString(upload.filename, 'filename');
  assertString(upload.mimeType, 'mimeType');

  if (!isAdminEditTempKey(upload.tempKey, sessionId)) {
    throw new AdminEditCommitError('tempKey 不属于当前编辑 session');
  }

  if (!ALLOWED_TYPES.includes(upload.mimeType)) {
    throw new AdminEditCommitError(`不支持的文件类型: ${upload.mimeType}`);
  }

  if (typeof upload.size !== 'number' || !Number.isFinite(upload.size) || upload.size <= 0) {
    throw new AdminEditCommitError('无效的 size');
  }

  const category = getSizeCategory(upload.mimeType);
  const maxSize = SIZE_LIMITS[category];
  if (upload.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    throw new AdminEditCommitError(`文件大小超出限制（最大 ${maxMB}MB）`);
  }
}

function normalizePendingUpload(upload: PendingUpload, sessionId: string): NormalizedUpload {
  assertString(upload.target, 'target');
  assertString(upload.targetId, 'targetId');
  assertString(upload.relation, 'relation');
  validateUploadMetadata(upload, sessionId);
  return upload;
}

function normalizeReplacementUpload(
  replacement: PendingReplacement,
  sessionId: string,
): NormalizedUpload | null {
  const upload = replacement.upload ?? replacement;

  if (!upload.tempKey && !upload.filename && !upload.mimeType && !upload.size) {
    return null;
  }

  const metadata: UploadMetadata = {
    uploadId: upload.uploadId,
    tempKey: upload.tempKey ?? '',
    filename: upload.filename ?? '',
    mimeType: upload.mimeType ?? '',
    size: upload.size ?? 0,
    alt: upload.alt,
    caption: upload.caption,
    mediaTag: upload.mediaTag,
    thumbnailUrl: upload.thumbnailUrl,
    width: upload.width,
    height: upload.height,
    duration: upload.duration,
  };

  validateUploadMetadata(metadata, sessionId);

  return {
    ...metadata,
    target: replacement.target,
    targetId: replacement.targetId,
    relation: replacement.relation,
  };
}

function getRelationConfig(
  target: string,
  relation: string,
): {
  directConfig: DirectFKConfig | null;
  m2mConfig: ManyToManyConfig | null;
} {
  const key = `${target}:${relation}`;
  return {
    directConfig: DIRECT_FK_MAP[key] ?? null,
    m2mConfig: MANY_TO_MANY_MAP[key] ?? null,
  };
}

function getDelegate(db: typeof prisma | Prisma.TransactionClient, model: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (db as any)[model] ?? null;
}

async function findRecord(db: typeof prisma | Prisma.TransactionClient, model: string, id: string) {
  const delegate = getDelegate(db, model);
  if (!delegate) return null;
  return delegate.findUnique({ where: { id } });
}

function serializeValue(value: unknown): string | null {
  return value === null || value === undefined ? null : JSON.stringify(value);
}

async function createMediaFromCopiedUpload(
  tx: Prisma.TransactionClient,
  copied: CopiedUpload,
  admin: AdminPayload,
) {
  const { upload, finalUrl } = copied;

  return tx.media.create({
    data: {
      type: getMediaType(upload.mimeType),
      category: getMediaCategory(upload.mimeType),
      mediaTag: upload.mediaTag || undefined,
      url: finalUrl,
      filename: upload.filename,
      mimeType: upload.mimeType,
      size: upload.size,
      thumbnailUrl: upload.thumbnailUrl || undefined,
      width: typeof upload.width === 'number' ? upload.width : undefined,
      height: typeof upload.height === 'number' ? upload.height : undefined,
      duration: typeof upload.duration === 'number' ? upload.duration : undefined,
      alt: upload.alt || undefined,
      caption: upload.caption || undefined,
      uploadedBy: admin.adminId,
    },
  });
}

async function copyUploadToFinal(upload: NormalizedUpload): Promise<CopiedUpload> {
  const finalKey = generateFinalKey(
    upload.mimeType,
    upload.filename,
    `${upload.target}-${upload.relation}`,
  );
  const copied = await copyFile(upload.tempKey, finalKey);

  return {
    upload,
    finalKey: copied.key,
    finalUrl: copied.url,
  };
}

async function applyFieldUpdates(
  tx: Prisma.TransactionClient,
  fields: PendingField[],
  admin: AdminPayload,
): Promise<void> {
  for (const pendingField of fields) {
    const { entityType, entityId, field, value } = pendingField;
    const allowedFields = EDITABLE_FIELDS[entityType];
    if (!allowedFields) {
      throw new AdminEditCommitError(`不支持的实体类型: ${entityType}`);
    }
    if (!allowedFields.includes(field)) {
      throw new AdminEditCommitError(`字段 "${field}" 不允许编辑`);
    }
    assertString(entityId, 'entityId');

    const model = ENTITY_MODEL_MAP[entityType];
    const delegate = getDelegate(tx, model);
    if (!delegate) {
      throw new AdminEditCommitError(`不支持的实体类型: ${entityType}`);
    }

    const entity = await delegate.findUnique({ where: { id: entityId } });
    if (!entity) {
      throw new AdminEditCommitError(`${entityType} #${entityId} 不存在`, 404);
    }

    const convertedValue = convertValue(field, value);
    const oldValue = entity[field] ?? null;

    await tx.editHistory.create({
      data: {
        entityType,
        entityId,
        field,
        oldValue: serializeValue(oldValue),
        newValue: serializeValue(convertedValue),
        editedBy: admin.adminId,
      },
    });

    await delegate.update({
      where: { id: entityId },
      data: { [field]: convertedValue },
    });
  }
}

async function validateTargetRecord(
  tx: Prisma.TransactionClient,
  target: string,
  targetId: string,
  model: string,
): Promise<unknown> {
  const record = await findRecord(tx, model, targetId);
  if (!record) {
    throw new AdminEditCommitError(`${target} 记录不存在（id: ${targetId}）`, 404);
  }
  return record;
}

async function applyRelationAdds(
  tx: Prisma.TransactionClient,
  copiedUploads: CopiedUpload[],
  admin: AdminPayload,
): Promise<void> {
  for (const copied of copiedUploads) {
    const { upload } = copied;
    const { directConfig, m2mConfig } = getRelationConfig(upload.target, upload.relation);

    if (directConfig) {
      throw new AdminEditCommitError(
        `pendingUploads 不支持直接替换关系，请使用 pendingReplacements: ${upload.target}:${upload.relation}`,
      );
    }
    if (!m2mConfig) {
      throw new AdminEditCommitError(
        `不支持的 target + relation 组合: ${upload.target}:${upload.relation}`,
      );
    }

    await validateTargetRecord(tx, upload.target, upload.targetId, m2mConfig.model);
    const media = await createMediaFromCopiedUpload(tx, copied, admin);
    const delegate = getDelegate(tx, m2mConfig.model);

    await delegate.update({
      where: { id: upload.targetId },
      data: {
        [m2mConfig.relationField]: {
          connect: { id: media.id },
        },
      },
    });
  }
}

async function applyRelationRemovals(
  tx: Prisma.TransactionClient,
  removals: PendingRemoval[],
): Promise<string[]> {
  const removedMediaIds: string[] = [];
  const directRemovals: PendingRemoval[] = [];
  const groupedManyToMany = new Map<
    string,
    {
      target: string;
      targetId: string;
      relation: string;
      config: ManyToManyConfig;
      mediaIds: Set<string>;
    }
  >();

  for (const removal of removals) {
    assertString(removal.target, 'target');
    assertString(removal.targetId, 'targetId');
    assertString(removal.relation, 'relation');

    const { directConfig, m2mConfig } = getRelationConfig(removal.target, removal.relation);
    if (!directConfig && !m2mConfig) {
      throw new AdminEditCommitError(
        `不支持的 target + relation 组合: ${removal.target}:${removal.relation}`,
      );
    }

    if (directConfig) {
      directRemovals.push(removal);
      continue;
    }

    assertString(removal.mediaId, 'mediaId');
    const key = `${removal.target}:${removal.targetId}:${removal.relation}`;
    const grouped = groupedManyToMany.get(key);
    if (grouped) {
      grouped.mediaIds.add(removal.mediaId);
    } else {
      groupedManyToMany.set(key, {
        target: removal.target,
        targetId: removal.targetId,
        relation: removal.relation,
        config: m2mConfig!,
        mediaIds: new Set([removal.mediaId]),
      });
    }
  }

  for (const removal of directRemovals) {
    const { directConfig } = getRelationConfig(removal.target, removal.relation);
    if (!directConfig) continue;

    const record = await validateTargetRecord(
      tx,
      removal.target,
      removal.targetId,
      directConfig.model,
    );
    const delegate = getDelegate(tx, directConfig.model);

    if (
      removal.mediaId &&
      (record as Record<string, unknown>)[directConfig.fkField] !== removal.mediaId
    ) {
      throw new AdminEditCommitError('待移除媒体与当前直接关系不一致', 409);
    }

    await delegate.update({
      where: { id: removal.targetId },
      data: { [directConfig.fkField]: null },
    });
    if (removal.mediaId) removedMediaIds.push(removal.mediaId);
  }

  for (const grouped of groupedManyToMany.values()) {
    const delegate = getDelegate(tx, grouped.config.model);
    const requestedMediaIds = Array.from(grouped.mediaIds);
    const record = (await delegate.findUnique({
      where: { id: grouped.targetId },
      select: { [grouped.config.relationField]: { select: { id: true } } },
    })) as Record<string, Array<{ id: string }>> | null;

    if (!record) {
      throw new AdminEditCommitError(
        `${grouped.target} 记录不存在（id: ${grouped.targetId}）`,
        404,
      );
    }

    const connectedIds = new Set(
      (record[grouped.config.relationField] ?? []).map((media) => media.id),
    );
    const mediaIds = requestedMediaIds.filter((id) => connectedIds.has(id));
    if (mediaIds.length === 0) continue;

    await delegate.update({
      where: { id: grouped.targetId },
      data: {
        [grouped.config.relationField]: {
          disconnect: mediaIds.map((id) => ({ id })),
        },
      },
    });
    removedMediaIds.push(...mediaIds);
  }

  return removedMediaIds;
}

async function applyDirectReplacements(
  tx: Prisma.TransactionClient,
  replacements: CopiedReplacement[],
  admin: AdminPayload,
): Promise<string[]> {
  const oldMediaIds: string[] = [];

  for (const item of replacements) {
    const { replacement, copied } = item;
    assertString(replacement.target, 'target');
    assertString(replacement.targetId, 'targetId');
    assertString(replacement.relation, 'relation');

    const { directConfig, m2mConfig } = getRelationConfig(replacement.target, replacement.relation);
    if (m2mConfig || !directConfig) {
      throw new AdminEditCommitError(
        `pendingReplacements 仅支持直接关系: ${replacement.target}:${replacement.relation}`,
      );
    }

    const record = await validateTargetRecord(
      tx,
      replacement.target,
      replacement.targetId,
      directConfig.model,
    );
    let nextMediaId = replacement.mediaId ?? null;

    if (copied) {
      const media = await createMediaFromCopiedUpload(tx, copied, admin);
      nextMediaId = media.id;
    }

    if (!nextMediaId) {
      throw new AdminEditCommitError('pendingReplacements 需要 mediaId 或 upload');
    }

    const media = await tx.media.findUnique({ where: { id: nextMediaId } });
    if (!media) {
      throw new AdminEditCommitError(`media #${nextMediaId} 不存在`, 404);
    }

    const oldValue = (record as Record<string, unknown>)[directConfig.fkField] ?? null;
    const delegate = getDelegate(tx, directConfig.model);

    await tx.editHistory.create({
      data: {
        entityType: replacement.target,
        entityId: replacement.targetId,
        field: directConfig.fkField,
        oldValue: serializeValue(oldValue),
        newValue: serializeValue(nextMediaId),
        editedBy: admin.adminId,
      },
    });

    await delegate.update({
      where: { id: replacement.targetId },
      data: { [directConfig.fkField]: nextMediaId },
    });

    if (typeof oldValue === 'string' && oldValue !== nextMediaId) {
      oldMediaIds.push(oldValue);
    }
  }

  return oldMediaIds;
}

async function validateEntryDeleteFramework(
  tx: Prisma.TransactionClient,
  deletes: PendingEntryDelete[],
): Promise<string[]> {
  const mediaIds: string[] = [];

  for (const item of deletes) {
    assertString(item.entityType, 'entityType');
    assertString(item.entityId, 'entityId');

    const model = ENTITY_MODEL_MAP[item.entityType];
    if (!model) {
      throw new AdminEditCommitError(`不支持的实体类型: ${item.entityType}`);
    }

    const record = await findRecord(tx, model, item.entityId);
    if (!record) {
      throw new AdminEditCommitError(`${item.entityType} #${item.entityId} 不存在`, 404);
    }

    mediaIds.push(...(await collectEntryMediaIds(tx, item)));
    await deleteContentRelationsForEntry(tx, item);

    const delegate = getDelegate(tx, model);
    await delegate.delete({ where: { id: item.entityId } });
  }

  return mediaIds;
}

async function deleteContentRelationsForEntry(
  tx: Prisma.TransactionClient,
  item: PendingEntryDelete,
): Promise<void> {
  const contentType = ENTITY_CONTENT_TYPE_MAP[item.entityType];
  if (!contentType) return;

  await tx.contentRelation.deleteMany({
    where: {
      OR: [
        { sourceType: contentType, sourceId: item.entityId },
        { targetType: contentType, targetId: item.entityId },
      ],
    },
  });
}

async function collectEntryMediaIds(
  tx: Prisma.TransactionClient,
  item: PendingEntryDelete,
): Promise<string[]> {
  const id = item.entityId;

  if (item.entityType === 'production') {
    const record = await tx.production.findUnique({
      where: { id },
      select: { posterId: true, gallery: { select: { id: true } } },
    });
    return uniqueIds([record?.posterId, ...(record?.gallery.map((media) => media.id) ?? [])]);
  }

  if (item.entityType === 'performance') {
    const record = await tx.performance.findUnique({
      where: { id },
      select: {
        posterId: true,
        gallery: { select: { id: true } },
        officialMedia: { select: { mediaId: true } },
        fanShots: { select: { mediaItems: { select: { id: true } } } },
      },
    });
    return uniqueIds([
      record?.posterId,
      ...(record?.gallery.map((media) => media.id) ?? []),
      ...(record?.officialMedia.map((media) => media.mediaId) ?? []),
      ...(record?.fanShots.flatMap((shot) => shot.mediaItems.map((media) => media.id)) ?? []),
    ]);
  }

  if (item.entityType === 'endorsement') {
    const record = await tx.endorsement.findUnique({
      where: { id },
      select: { coverImageId: true, media: { select: { id: true } } },
    });
    return uniqueIds([record?.coverImageId, ...(record?.media.map((media) => media.id) ?? [])]);
  }

  if (item.entityType === 'livestream') {
    const record = await tx.livestream.findUnique({
      where: { id },
      select: { coverImageId: true, media: { select: { id: true } } },
    });
    return uniqueIds([record?.coverImageId, ...(record?.media.map((media) => media.id) ?? [])]);
  }

  if (item.entityType === 'album') {
    const record = await tx.album.findUnique({ where: { id }, select: { coverId: true } });
    return uniqueIds([record?.coverId]);
  }

  if (item.entityType === 'magazine') {
    const record = await tx.magazine.findUnique({
      where: { id },
      select: { coverId: true, scans: { select: { id: true } } },
    });
    return uniqueIds([record?.coverId, ...(record?.scans.map((media) => media.id) ?? [])]);
  }

  if (item.entityType === 'interview') {
    const record = await tx.interview.findUnique({
      where: { id },
      select: {
        originalMediaId: true,
        coverImageId: true,
        gallery: { select: { id: true } },
      },
    });
    return uniqueIds([
      record?.originalMediaId,
      record?.coverImageId,
      ...(record?.gallery.map((media) => media.id) ?? []),
    ]);
  }

  if (item.entityType === 'socialPost') {
    const record = await tx.socialPost.findUnique({
      where: { id },
      select: { mediaItems: { select: { id: true } } },
    });
    return uniqueIds(record?.mediaItems.map((media) => media.id) ?? []);
  }

  if (item.entityType === 'newsArticle') {
    const record = await tx.newsArticle.findUnique({
      where: { id },
      select: { mediaItems: { select: { id: true } } },
    });
    return uniqueIds(record?.mediaItems.map((media) => media.id) ?? []);
  }

  if (item.entityType === 'sighting') {
    const record = await tx.sighting.findUnique({
      where: { id },
      select: { mediaItems: { select: { id: true } } },
    });
    return uniqueIds(record?.mediaItems.map((media) => media.id) ?? []);
  }

  if (item.entityType === 'mediaCollection') {
    const record = await tx.mediaCollection.findUnique({
      where: { id },
      select: { coverId: true, items: { select: { id: true } } },
    });
    return uniqueIds([record?.coverId, ...(record?.items.map((media) => media.id) ?? [])]);
  }

  return [];
}

function uniqueIds(ids: Iterable<string | null | undefined>) {
  return Array.from(new Set(Array.from(ids).filter((id): id is string => Boolean(id))));
}

async function cleanupTempFiles(keys: string[]): Promise<{ cleaned: number; failed: number }> {
  if (keys.length === 0) return { cleaned: 0, failed: 0 };

  try {
    await deleteFiles(keys);
    return { cleaned: keys.length, failed: 0 };
  } catch (error) {
    console.error('[Admin Edit Commit] Temp cleanup failed:', error);
    return { cleaned: 0, failed: keys.length };
  }
}

export async function commitAdminEdit(
  payload: AdminEditCommitPayload,
  admin: AdminPayload,
): Promise<CommitSummary> {
  assertString(payload.sessionId, 'sessionId');

  const pendingFields = assertArray(payload.pendingFields, 'pendingFields');
  const pendingUploads = assertArray(payload.pendingUploads, 'pendingUploads').map((upload) =>
    normalizePendingUpload(upload, payload.sessionId),
  );
  const pendingRemovals = assertArray(payload.pendingRemovals, 'pendingRemovals');
  const pendingReplacements = assertArray(payload.pendingReplacements, 'pendingReplacements');
  const pendingEntryDeletes = assertArray(payload.pendingEntryDeletes, 'pendingEntryDeletes');

  const copiedFinalKeys: string[] = [];
  const tempKeysToCleanup: string[] = [];
  let mediaIdsToCleanup: string[] = [];

  try {
    const copiedUploads: CopiedUpload[] = [];
    for (const upload of pendingUploads) {
      const copied = await copyUploadToFinal(upload);
      copiedUploads.push(copied);
      copiedFinalKeys.push(copied.finalKey);
      tempKeysToCleanup.push(upload.tempKey);
    }

    const replacementItems: CopiedReplacement[] = [];
    for (const replacement of pendingReplacements) {
      const upload = normalizeReplacementUpload(replacement, payload.sessionId);
      const copied = upload ? await copyUploadToFinal(upload) : undefined;
      if (copied) {
        copiedFinalKeys.push(copied.finalKey);
        tempKeysToCleanup.push(upload!.tempKey);
      }
      replacementItems.push({ replacement, upload: upload ?? undefined, copied });
    }

    await prisma.$transaction(async (tx) => {
      await applyFieldUpdates(tx, pendingFields, admin);
      await applyRelationAdds(tx, copiedUploads, admin);
      const removedMediaIds = await applyRelationRemovals(tx, pendingRemovals);
      const oldDirectMediaIds = await applyDirectReplacements(tx, replacementItems, admin);
      const entryMediaIds = await validateEntryDeleteFramework(tx, pendingEntryDeletes);
      mediaIdsToCleanup = [...removedMediaIds, ...oldDirectMediaIds, ...entryMediaIds];
    });

    const cleanupResult = await cleanupTempFiles(tempKeysToCleanup);
    await cleanupUnreferencedMedia(mediaIdsToCleanup);

    return {
      fieldsUpdated: pendingFields.length,
      uploadsAdded: copiedUploads.length,
      relationsRemoved: pendingRemovals.length,
      directReplacements: pendingReplacements.length,
      entryDeletesSkipped: 0,
      tempFilesCleaned: cleanupResult.cleaned,
      tempCleanupFailed: cleanupResult.failed,
    };
  } catch (error) {
    await cleanupTempFiles(copiedFinalKeys);
    throw error;
  }
}
