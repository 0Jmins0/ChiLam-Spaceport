import { prisma } from '@/lib/db';
import { deleteFiles, getKeyFromUrl } from '@/lib/r2';
import {
  DIRECT_FK_RELATIONS,
  DirectFkMediaRelation,
  MANY_TO_MANY_RELATIONS,
  ManyToManyMediaRelation,
  MediaRelationModel,
  findDirectFkMediaRelation,
  findManyToManyMediaRelation,
} from '@/lib/media-relations';

type ModelDelegate = {
  count(args: { where?: Record<string, unknown> }): Promise<number>;
  findUnique(args: Record<string, unknown>): Promise<Record<string, unknown> | null>;
  update(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
};

type PrismaDelegateProvider = Record<MediaRelationModel | 'media', ModelDelegate>;

type PrismaLike = unknown;

export type MediaReferenceDetail = {
  kind: 'direct-fk' | 'many-to-many';
  model: MediaRelationModel;
  field: string;
  count: number;
};

export type MediaReferenceCheck = {
  mediaId: string;
  total: number;
  details: MediaReferenceDetail[];
};

export type CleanupMediaResult = {
  mediaId: string;
  deleted: boolean;
  reason?: 'not_found' | 'referenced';
  references?: MediaReferenceCheck;
};

function getDelegate(client: PrismaLike, model: MediaRelationModel | 'media'): ModelDelegate {
  return (client as unknown as PrismaDelegateProvider)[model];
}

function uniqueMediaIds(mediaIds: Iterable<string | null | undefined>): string[] {
  return Array.from(new Set(Array.from(mediaIds).filter((id): id is string => Boolean(id))));
}

async function deleteR2ObjectForMedia(media: Record<string, unknown>) {
  const url = typeof media.url === 'string' ? media.url : null;
  const thumbnailUrl = typeof media.thumbnailUrl === 'string' ? media.thumbnailUrl : null;
  const keys = [getKeyFromUrl(url), getKeyFromUrl(thumbnailUrl)].filter(Boolean) as string[];
  if (keys.length === 0) return;

  try {
    await deleteFiles(keys);
  } catch (error) {
    console.error('R2 delete error (non-blocking):', error);
  }
}

export async function checkMediaReferences(
  mediaId: string,
  client: PrismaLike = prisma,
): Promise<MediaReferenceCheck> {
  const directCounts = await Promise.all(
    Object.values(DIRECT_FK_RELATIONS).map(async (config) => {
      const count = await getDelegate(client, config.model).count({
        where: { [config.fkField]: mediaId },
      });

      return {
        kind: 'direct-fk' as const,
        model: config.model,
        field: config.fkField,
        count,
      };
    }),
  );

  const manyToManyCounts = await Promise.all(
    Object.values(MANY_TO_MANY_RELATIONS).map(async (config) => {
      const count = await getDelegate(client, config.model).count({
        where: { [config.relationField]: { some: { id: mediaId } } },
      });

      return {
        kind: 'many-to-many' as const,
        model: config.model,
        field: config.relationField,
        count,
      };
    }),
  );

  const details = [...directCounts, ...manyToManyCounts].filter((item) => item.count > 0);

  return {
    mediaId,
    details,
    total: details.reduce((sum, item) => sum + item.count, 0),
  };
}

export async function deleteMediaIfUnreferenced(
  mediaId: string,
  client: PrismaLike = prisma,
): Promise<CleanupMediaResult> {
  const mediaDelegate = getDelegate(client, 'media');
  const media = await mediaDelegate.findUnique({ where: { id: mediaId } });

  if (!media) {
    return { mediaId, deleted: false, reason: 'not_found' };
  }

  const references = await checkMediaReferences(mediaId, client);
  if (references.total > 0) {
    return { mediaId, deleted: false, reason: 'referenced', references };
  }

  await mediaDelegate.delete({ where: { id: mediaId } });
  await deleteR2ObjectForMedia(media);

  return { mediaId, deleted: true };
}

export async function cleanupUnreferencedMedia(
  mediaIds: Iterable<string | null | undefined>,
  client: PrismaLike = prisma,
): Promise<CleanupMediaResult[]> {
  const ids = uniqueMediaIds(mediaIds);
  const results: CleanupMediaResult[] = [];

  for (const mediaId of ids) {
    results.push(await deleteMediaIfUnreferenced(mediaId, client));
  }

  return results;
}

export async function replaceDirectMediaReference({
  target,
  relation,
  where,
  nextMediaId,
  client = prisma,
  cleanup = true,
}: {
  target: string;
  relation: string;
  where: Record<string, unknown>;
  nextMediaId: string | null;
  client?: PrismaLike;
  cleanup?: boolean;
}): Promise<{ oldMediaId: string | null; nextMediaId: string | null }> {
  const config = findDirectFkMediaRelation(target, relation);
  if (!config) {
    throw new Error(`不支持的直接媒体关系: ${target}:${relation}`);
  }

  if (!config.nullable && nextMediaId === null) {
    throw new Error(`媒体关系不可置空: ${target}:${relation}`);
  }

  return replaceDirectMediaReferenceByConfig({
    config,
    where,
    nextMediaId,
    client,
    cleanup,
  });
}

export async function replaceDirectMediaReferenceByConfig({
  config,
  where,
  nextMediaId,
  client = prisma,
  cleanup = true,
}: {
  config: DirectFkMediaRelation;
  where: Record<string, unknown>;
  nextMediaId: string | null;
  client?: PrismaLike;
  cleanup?: boolean;
}): Promise<{ oldMediaId: string | null; nextMediaId: string | null }> {
  if (!config.nullable && nextMediaId === null) {
    throw new Error(`媒体关系不可置空: ${config.target}:${config.relation}`);
  }

  const delegate = getDelegate(client, config.model);
  const existing = await delegate.findUnique({
    where,
    select: { [config.fkField]: true },
  });

  if (!existing) {
    throw new Error(`记录不存在: ${config.model}`);
  }

  const oldMediaId =
    typeof existing[config.fkField] === 'string' ? (existing[config.fkField] as string) : null;

  await delegate.update({
    where,
    data: { [config.fkField]: nextMediaId },
  });

  if (cleanup && oldMediaId && oldMediaId !== nextMediaId) {
    await deleteMediaIfUnreferenced(oldMediaId, client);
  }

  return { oldMediaId, nextMediaId };
}

export async function disconnectManyToManyMediaRelation({
  target,
  relation,
  where,
  mediaIds,
  client = prisma,
  cleanup = true,
}: {
  target: string;
  relation: string;
  where: Record<string, unknown>;
  mediaIds: string[];
  client?: PrismaLike;
  cleanup?: boolean;
}): Promise<string[]> {
  const config = findManyToManyMediaRelation(target, relation);
  if (!config) {
    throw new Error(`不支持的多对多媒体关系: ${target}:${relation}`);
  }

  return disconnectManyToManyMediaRelationByConfig({
    config,
    where,
    mediaIds,
    client,
    cleanup,
  });
}

export async function disconnectManyToManyMediaRelationByConfig({
  config,
  where,
  mediaIds,
  client = prisma,
  cleanup = true,
}: {
  config: ManyToManyMediaRelation;
  where: Record<string, unknown>;
  mediaIds: string[];
  client?: PrismaLike;
  cleanup?: boolean;
}): Promise<string[]> {
  const ids = uniqueMediaIds(mediaIds);
  if (ids.length === 0) return [];

  await getDelegate(client, config.model).update({
    where,
    data: {
      [config.relationField]: {
        disconnect: ids.map((id) => ({ id })),
      },
    },
  });

  if (cleanup) {
    await cleanupUnreferencedMedia(ids, client);
  }

  return ids;
}
