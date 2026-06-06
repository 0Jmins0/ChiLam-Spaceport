'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition-opacity duration-300 md:hidden',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-dark/80" onClick={onClose} />

      {/* Panel */}
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-72 bg-bg-dark border-l border-border-gold p-8 transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="mb-12 text-text-secondary hover:text-accent transition-colors"
          aria-label="关闭菜单"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Nav items */}
        <nav className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'text-lg tracking-wide transition-colors duration-150',
                pathname.startsWith(item.href)
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-accent',
              )}
            >
              <span>{item.label}</span>
              <span className="ml-2 text-xs text-text-muted">{item.labelEn}</span>
            </Link>
          ))}
        </nav>

        {/* Logo at bottom */}
        <div className="absolute bottom-8 left-8">
          <p className="font-heading text-sm tracking-wider text-accent/50">{siteConfig.name}</p>
        </div>
      </div>
    </div>
  );
}
