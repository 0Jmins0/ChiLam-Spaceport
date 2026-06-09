'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';
import { MobileNav } from './MobileNav';
import { SearchModal } from './SearchModal';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, openLogin } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled ? 'glass border-b border-border-gold' : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-[var(--width-page)] items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-baseline gap-2">
            <span className="font-heading text-xl font-semibold tracking-wider text-accent">
              {siteConfig.name}
            </span>
            <span className="hidden text-sm text-text-secondary sm:inline">
              {siteConfig.nameCn}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative text-sm tracking-wide transition-colors duration-150',
                  (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-accent',
                )}
              >
                {item.label}
                {(item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[0.5px] bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          {/* Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center text-text-secondary transition-colors hover:text-accent md:flex"
            aria-label="搜索"
          >
            <svg
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>

          {/* Auth */}
          <div className="hidden md:flex items-center ml-6">
            {loading ? (
              <span className="h-7 w-7 rounded-full bg-border-gold/20 animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <button
                onClick={openLogin}
                className="text-sm text-text-secondary hover:text-accent transition-colors tracking-wide"
              >
                登录
              </button>
            )}
          </div>

          {/* Mobile Search + Menu */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="text-text-secondary transition-colors hover:text-accent"
              aria-label="搜索"
            >
              <svg
                className="h-[18px] w-[18px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
            <button
              className="flex flex-col gap-1.5"
              onClick={() => setMobileOpen(true)}
              aria-label="打开菜单"
            >
              <span className="block h-[1px] w-5 bg-text-primary" />
              <span className="block h-[1px] w-5 bg-text-primary" />
              <span className="block h-[1px] w-3.5 bg-text-primary" />
            </button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
