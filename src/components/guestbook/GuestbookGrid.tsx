'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { GuestbookCard } from '@/components/guestbook/GuestbookCard';
import type { GuestbookItem } from '@/lib/types';

interface GuestbookGridProps {
  items: GuestbookItem[];
}

export function GuestbookGrid({ items }: GuestbookGridProps) {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <GuestbookCard key={item.id} item={item} currentUserId={user?.id} />
      ))}
    </div>
  );
}
