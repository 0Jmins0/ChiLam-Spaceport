export type UpdateMediaPreview = {
  url: string;
  type: string;
  width: number | null;
  height: number | null;
  duration?: number | null;
};

type UpdateMediaItem = {
  url: string;
  thumbnailUrl?: string | null;
  type: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
};

export function getUpdatePreviewMedia(
  thumbnailUrl: string | null | undefined,
  mediaItems?: UpdateMediaItem[],
): UpdateMediaPreview | null {
  const firstMedia = mediaItems?.[0];

  if (firstMedia) {
    const isVideo = firstMedia.type === 'VIDEO';
    return {
      url: isVideo
        ? (firstMedia.thumbnailUrl ?? thumbnailUrl ?? '')
        : (thumbnailUrl ?? firstMedia.url),
      type: firstMedia.type,
      width: firstMedia.width ?? null,
      height: firstMedia.height ?? null,
      duration: firstMedia.duration ?? null,
    };
  }

  if (thumbnailUrl) {
    return {
      url: thumbnailUrl,
      type: 'IMAGE',
      width: null,
      height: null,
      duration: null,
    };
  }

  return null;
}

export function getMediaAspectRatio(
  media:
    | {
        type?: string | null;
        width?: number | null;
        height?: number | null;
      }
    | null
    | undefined,
) {
  if (media?.width && media.height) {
    const ratio = media.width / media.height;
    if (Number.isFinite(ratio) && ratio > 0) return ratio;
  }

  if (media?.type === 'VIDEO') return 16 / 9;
  return 4 / 5;
}
