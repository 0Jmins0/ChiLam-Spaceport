'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

interface LikeButtonProps {
  id: string;
  initialCount: number;
}

export function LikeButton({ id, initialCount }: LikeButtonProps) {
  const { user, openLogin } = useAuth();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 初始化检查是否已赞
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('user_token');
    if (!token) return;

    let cancelled = false;
    fetch(`/api/messages/${id}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.data) setLiked(data.data.liked);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handleLike = async () => {
    if (loading) return;

    if (!user) {
      openLogin();
      return;
    }

    const token = localStorage.getItem('user_token');
    if (!token) {
      openLogin();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/messages/${id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.data.likesCount);
        setLiked(data.data.liked);
      }
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors border ${
        liked
          ? 'border-accent/50 bg-accent/10 text-accent'
          : 'border-border-gold/50 text-text-muted hover:border-accent/50 hover:text-accent'
      }`}
    >
      <svg
        className="h-4 w-4"
        fill={liked ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {count}
    </button>
  );
}
