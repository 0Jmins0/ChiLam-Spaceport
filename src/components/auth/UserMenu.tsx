'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthProvider';

export function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  if (!user) return null;

  const displayName = user.displayName || user.username;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={displayName}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full border border-border-gold object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border-gold bg-accent/10 text-xs text-accent">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="hidden sm:inline max-w-[100px] truncate">{displayName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-40 rounded-[var(--radius-card)] border border-border-gold bg-bg-darker py-1 shadow-xl">
          <div className="px-3 py-2 border-b border-border-gold/30">
            <p className="text-xs text-text-muted truncate">{user.username}</p>
          </div>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="block w-full px-3 py-2 text-left text-sm text-text-secondary hover:text-accent hover:bg-accent/5 transition-colors"
          >
            个人中心
          </Link>
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="w-full px-3 py-2 text-left text-sm text-text-secondary hover:text-accent hover:bg-accent/5 transition-colors"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
