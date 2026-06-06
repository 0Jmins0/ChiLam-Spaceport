'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { siteConfig } from '@/config/site';

export function YearMarquee() {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - siteConfig.careerStartYear + 1 },
    (_, i) => siteConfig.careerStartYear + i,
  );

  const [glowIndex, setGlowIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIndex(Math.floor(Math.random() * years.length));
    }, 3000);
    return () => clearInterval(interval);
  }, [years.length]);

  return (
    <div className="overflow-hidden py-3">
      <div className="flex justify-center gap-3">
        {years.map((year, i) => (
          <span
            key={year}
            className={cn(
              'font-display text-xs italic select-none transition-colors duration-1000',
              i === glowIndex ? 'text-accent/40' : 'text-text-primary/5',
            )}
          >
            {year}
          </span>
        ))}
      </div>
    </div>
  );
}
