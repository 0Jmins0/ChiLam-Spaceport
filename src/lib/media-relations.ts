export type MediaRelationModel =
  | 'production'
  | 'performance'
  | 'album'
  | 'magazine'
  | 'interview'
  | 'livestream'
  | 'endorsement'
  | 'mediaCollection'
  | 'comment'
  | 'performanceMedia'
  | 'socialPost'
  | 'sighting'
  | 'guestbook'
  | 'fanShot'
  | 'newsArticle';

export type DirectFkMediaRelation = {
  target: string;
  relation: string;
  model: MediaRelationModel;
  fkField: string;
  nullable: boolean;
};

export type ManyToManyMediaRelation = {
  target: string;
  relation: string;
  model: MediaRelationModel;
  relationField: string;
};

export const DIRECT_FK_RELATIONS = {
  'production:poster': {
    target: 'production',
    relation: 'poster',
    model: 'production',
    fkField: 'posterId',
    nullable: true,
  },
  'performance:poster': {
    target: 'performance',
    relation: 'poster',
    model: 'performance',
    fkField: 'posterId',
    nullable: true,
  },
  'album:cover': {
    target: 'album',
    relation: 'cover',
    model: 'album',
    fkField: 'coverId',
    nullable: true,
  },
  'magazine:cover': {
    target: 'magazine',
    relation: 'cover',
    model: 'magazine',
    fkField: 'coverId',
    nullable: true,
  },
  'interview:media': {
    target: 'interview',
    relation: 'media',
    model: 'interview',
    fkField: 'originalMediaId',
    nullable: true,
  },
  'interview:cover': {
    target: 'interview',
    relation: 'cover',
    model: 'interview',
    fkField: 'coverImageId',
    nullable: true,
  },
  'livestream:cover': {
    target: 'livestream',
    relation: 'cover',
    model: 'livestream',
    fkField: 'coverImageId',
    nullable: true,
  },
  'endorsement:cover': {
    target: 'endorsement',
    relation: 'cover',
    model: 'endorsement',
    fkField: 'coverImageId',
    nullable: true,
  },
  'mediaCollection:cover': {
    target: 'mediaCollection',
    relation: 'cover',
    model: 'mediaCollection',
    fkField: 'coverId',
    nullable: true,
  },
  'comment:image': {
    target: 'comment',
    relation: 'image',
    model: 'comment',
    fkField: 'imageId',
    nullable: true,
  },
  'performanceMedia:media': {
    target: 'performanceMedia',
    relation: 'media',
    model: 'performanceMedia',
    fkField: 'mediaId',
    nullable: false,
  },
} as const satisfies Record<string, DirectFkMediaRelation>;

export const MANY_TO_MANY_RELATIONS = {
  'production:gallery': {
    target: 'production',
    relation: 'gallery',
    model: 'production',
    relationField: 'gallery',
  },
  'performance:gallery': {
    target: 'performance',
    relation: 'gallery',
    model: 'performance',
    relationField: 'gallery',
  },
  'interview:gallery': {
    target: 'interview',
    relation: 'gallery',
    model: 'interview',
    relationField: 'gallery',
  },
  'socialPost:media': {
    target: 'socialPost',
    relation: 'media',
    model: 'socialPost',
    relationField: 'mediaItems',
  },
  'endorsement:media': {
    target: 'endorsement',
    relation: 'media',
    model: 'endorsement',
    relationField: 'media',
  },
  'sighting:media': {
    target: 'sighting',
    relation: 'media',
    model: 'sighting',
    relationField: 'mediaItems',
  },
  'guestbook:images': {
    target: 'guestbook',
    relation: 'images',
    model: 'guestbook',
    relationField: 'images',
  },
  'fanShot:media': {
    target: 'fanShot',
    relation: 'media',
    model: 'fanShot',
    relationField: 'mediaItems',
  },
  'magazine:scans': {
    target: 'magazine',
    relation: 'scans',
    model: 'magazine',
    relationField: 'scans',
  },
  'livestream:media': {
    target: 'livestream',
    relation: 'media',
    model: 'livestream',
    relationField: 'media',
  },
  'newsArticle:media': {
    target: 'newsArticle',
    relation: 'media',
    model: 'newsArticle',
    relationField: 'mediaItems',
  },
  'mediaCollection:items': {
    target: 'mediaCollection',
    relation: 'items',
    model: 'mediaCollection',
    relationField: 'items',
  },
} as const satisfies Record<string, ManyToManyMediaRelation>;

export type DirectFkRelationKey = keyof typeof DIRECT_FK_RELATIONS;
export type ManyToManyRelationKey = keyof typeof MANY_TO_MANY_RELATIONS;

export function getMediaRelationKey(target: string, relation: string): string {
  return `${target}:${relation}`;
}

export function findDirectFkMediaRelation(
  target: string,
  relation: string,
): DirectFkMediaRelation | null {
  const key = getMediaRelationKey(target, relation) as DirectFkRelationKey;
  return DIRECT_FK_RELATIONS[key] ?? null;
}

export function findManyToManyMediaRelation(
  target: string,
  relation: string,
): ManyToManyMediaRelation | null {
  const key = getMediaRelationKey(target, relation) as ManyToManyRelationKey;
  return MANY_TO_MANY_RELATIONS[key] ?? null;
}

export function findMediaRelation(target: string, relation: string) {
  return (
    findDirectFkMediaRelation(target, relation) ?? findManyToManyMediaRelation(target, relation)
  );
}

export function getDirectFkRelationsForModel(model: MediaRelationModel): DirectFkMediaRelation[] {
  return Object.values(DIRECT_FK_RELATIONS).filter((config) => config.model === model);
}

export function getManyToManyRelationsForModel(
  model: MediaRelationModel,
): ManyToManyMediaRelation[] {
  return Object.values(MANY_TO_MANY_RELATIONS).filter((config) => config.model === model);
}
