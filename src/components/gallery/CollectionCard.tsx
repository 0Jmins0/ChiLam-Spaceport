import Image from 'next/image';
import Link from 'next/link';
import type { GalleryCollectionItem } from '@/lib/types';

interface CollectionCardProps {
  collection: GalleryCollectionItem;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <Link
      href={`/gallery/collections/${collection.slug}`}
      className="group overflow-hidden rounded-lg bg-white/5 transition-colors hover:bg-white/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {collection.coverUrl ? (
          <Image
            src={collection.coverUrl}
            alt={collection.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-900/20 to-amber-700/10">
            <svg
              className="h-12 w-12 text-amber-500/30"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}
        {/* 数量标记 */}
        <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white/80 backdrop-blur-sm">
          {collection.itemCount} 项
        </div>
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium text-white/90">{collection.title}</h3>
        {collection.description && (
          <p className="mt-1 line-clamp-2 text-xs text-white/50">{collection.description}</p>
        )}
      </div>
    </Link>
  );
}
