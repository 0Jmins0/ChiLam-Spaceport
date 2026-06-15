'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WaterfallLayout } from '@/components/ui/WaterfallLayout';
import { GalleryCard } from './GalleryCard';
import { LightboxViewer } from './LightboxViewer';
import type { GalleryItem } from '@/lib/types';

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('user_token');
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || '删除失败');
      }
    } catch {
      alert('删除失败');
    }
  };

  return (
    <>
      <WaterfallLayout>
        {items.map((item, index) => (
          <GalleryCard
            key={item.id}
            item={item}
            priority={index < 4}
            onClick={() => setLightboxIndex(index)}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </WaterfallLayout>

      {lightboxIndex !== null && (
        <LightboxViewer
          items={items}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
