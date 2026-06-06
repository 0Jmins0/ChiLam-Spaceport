'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/config/navigation';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/cn';
import { MobileNav } from './MobileNav';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
                  pathname.startsWith(item.href)
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-accent',
                )}
              >
                {item.label}
                {pathname.startsWith(item.href) && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[0.5px] bg-accent" />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="flex flex-col gap-1.5 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="打开菜单"
          >
            <span className="block h-[1px] w-5 bg-text-primary" />
            <span className="block h-[1px] w-5 bg-text-primary" />
            <span className="block h-[1px] w-3.5 bg-text-primary" />
          </button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
