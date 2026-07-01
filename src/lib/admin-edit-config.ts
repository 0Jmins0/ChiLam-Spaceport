import { prisma } from '@/lib/db';

export const EDITABLE_FIELDS: Record<string, string[]> = {
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

export type EditableValue = string | number | boolean | null;

export function getEditableFields(entityType: string): string[] | null {
  return EDITABLE_FIELDS[entityType] ?? null;
}

export function assertEditableField(entityType: string, field: string) {
  const allowedFields = getEditableFields(entityType);
  if (!allowedFields) {
    throw new Error(`不支持的实体类型: ${entityType}`);
  }
  if (!allowedFields.includes(field)) {
    throw new Error(`字段 "${field}" 不允许编辑`);
  }
}

export function getEditableModel(entityType: string, client: unknown = prisma) {
  const models = client as Record<string, unknown>;
  const model = models[entityType];
  if (!model) throw new Error(`不支持的实体类型: ${entityType}`);

  return model as {
    findUnique: (args: unknown) => Promise<Record<string, unknown> | null>;
    update: (args: unknown) => Promise<unknown>;
  };
}

export function convertEditableValue(field: string, value: EditableValue): unknown {
  if (value === null) return null;

  if (INTEGER_FIELDS.has(field)) {
    const parsed = parseInt(String(value), 10);
    if (Number.isNaN(parsed)) throw new Error(`字段 "${field}" 需要整数值`);
    return parsed;
  }

  if (NUMBER_FIELDS.has(field)) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) throw new Error(`字段 "${field}" 需要数字值`);
    return parsed;
  }

  if (DATE_FIELDS.has(field)) {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) throw new Error(`字段 "${field}" 需要有效的日期格式`);
    return date;
  }

  if (BOOLEAN_FIELDS.has(field)) {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    throw new Error(`字段 "${field}" 需要布尔值`);
  }

  return String(value);
}
