'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GalleryFilterBar } from '@/components/gallery/GalleryFilterBar';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { CollectionCard } from '@/components/gallery/CollectionCard';
import { CreateCollectionModal } from '@/components/gallery/CreateCollectionModal';
import { MasonryLayout } from '@/components/ui/MasonryLayout';
import { useEditMode } from '@/components/edit/EditModeProvider';
import type { GalleryItem, GalleryCollectionItem } from '@/lib/types';

interface GalleryPageClientProps {
  tab: string;
  tag: string;
  counts: {
    image: number;
    video: number;
    audio: number;
    collection: number;
  };
  items: GalleryItem[];
  collections: GalleryCollectionItem[];
  totalPages: number;
  currentPage: number;
}

export function GalleryPageClient({
  tab,
  tag,
  counts,
  items,
  collections,
}: GalleryPageClientProps) {
  const router = useRouter();
  const { editMode } = useEditMode();
  const [showCreateCollection, setShowCreateCollection] = useState(false);

  const handleTabChange = (newTab: string) => {
    router.push(`/gallery?tab=${newTab}`);
  };

  const handleTagChange = (newTag: string) => {
    if (newTag === 'all') {
      router.push(`/gallery?tab=${tab}`);
    } else {
      router.push(`/gallery?tab=${tab}&tag=${newTag}`);
    }
  };

  return (
    <>
      <div className="mb-8">
        <GalleryFilterBar
          currentTab={tab}
          currentTag={tag}
          counts={counts}
          onTabChange={handleTabChange}
          onTagChange={handleTagChange}
        />
      </div>

      {tab === 'collection' ? (
        <>
          {editMode && (
            <div className="mb-6">
              <button
                onClick={() => setShowCreateCollection(true)}
                className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-2 text-sm text-amber-500 transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
              >
                + 新建相册集
              </button>
            </div>
          )}
          {collections.length > 0 ? (
            <MasonryLayout>
              {collections.map((c) => (
                <CollectionCard key={c.id} collection={c} />
              ))}
            </MasonryLayout>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-text-muted">暂无相册集</p>
            </div>
          )}
        </>
      ) : items.length > 0 ? (
        <GalleryGrid items={items} />
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-text-muted">暂无媒体文件</p>
        </div>
      )}

      <CreateCollectionModal
        isOpen={showCreateCollection}
        onClose={() => setShowCreateCollection(false)}
      />
    </>
  );
}
