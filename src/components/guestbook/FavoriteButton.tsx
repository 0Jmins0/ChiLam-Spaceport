'use client';

import { useState } from 'react';

interface FavoriteButtonProps {
  id: string;
}

export function FavoriteButton({ id }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = JSON.parse(localStorage.getItem('favorite_messages') || '[]') as string[];
      return stored.includes(id);
    } catch {
      return false;
    }
  });

  const handleToggle = () => {
    const stored = JSON.parse(localStorage.getItem('favorite_messages') || '[]') as string[];

    if (favorited) {
      const updated = stored.filter((item) => item !== id);
      localStorage.setItem('favorite_messages', JSON.stringify(updated));
      setFavorited(false);
    } else {
      stored.push(id);
      localStorage.setItem('favorite_messages', JSON.stringify(stored));
      setFavorited(true);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors border ${
        favorited
          ? 'border-accent/50 bg-accent/10 text-accent'
          : 'border-border-gold/50 text-text-muted hover:border-accent/50 hover:text-accent'
      }`}
    >
      <svg
        className="h-4 w-4"
        fill={favorited ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
      {favorited ? '已收藏' : '收藏'}
    </button>
  );
}
