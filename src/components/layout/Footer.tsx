import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { NAV_ITEMS } from '@/config/navigation';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - siteConfig.careerStartYear + 1 },
    (_, i) => siteConfig.careerStartYear + i,
  );

  return (
    <footer className="border-t border-border-gold bg-bg-darker">
      <div className="mx-auto max-w-[var(--width-page)] px-6 py-12">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Left: Copyright */}
          <div className="space-y-3">
            <p className="font-heading text-sm tracking-wider text-accent">{siteConfig.name}</p>
            <p className="text-xs text-text-muted">
              &copy; {currentYear} Chilam Is Here. All rights reserved.
            </p>
            <p className="text-xs text-text-muted">Contact: {siteConfig.contactEmail}</p>
          </div>

          {/* Center: Quick links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 md:justify-center">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-text-muted transition-colors hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Social + Legal */}
          <div className="space-y-3 md:text-right">
            <div className="flex gap-4 md:justify-end">
              {siteConfig.socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-text-muted transition-colors hover:text-accent"
                  aria-label={link.name}
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="flex gap-4 md:justify-end">
              {siteConfig.footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs text-text-muted transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Year marquee */}
      <div className="overflow-hidden border-t border-border-gold py-3">
        <div className="flex justify-center gap-3">
          {years.map((year) => (
            <span
              key={year}
              className="font-display text-xs italic text-text-primary/5 select-none"
            >
              {year}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
