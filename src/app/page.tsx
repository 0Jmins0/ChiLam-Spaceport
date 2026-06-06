import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { NAV_ITEMS } from '@/config/navigation';

export default function HomePage() {
  return (
    <>
      {/* Hero Section - 全屏首屏 */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-dark">
        {/* 背景占位（将来放大图） */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-dark via-bg-dark/90 to-bg-dark" />

        {/* 大字水印 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="select-none font-heading text-[8rem] font-bold uppercase leading-none tracking-[0.3em] text-text-primary/[0.03] md:text-[12rem]">
            JULIAN
          </h1>
        </div>

        {/* 中心内容 */}
        <div className="relative z-10 text-center">
          <p className="font-display text-sm italic tracking-[0.5em] text-accent/60">
            EST. {siteConfig.careerStartYear}
          </p>
          <h2 className="mt-4 font-heading text-4xl font-semibold tracking-wider text-text-primary md:text-6xl">
            {siteConfig.name}
          </h2>
          <p className="mt-2 font-heading text-lg tracking-widest text-text-secondary md:text-xl">
            {siteConfig.nameCn}
          </p>
          <div className="mx-auto mt-6 w-16">
            <div className="gold-line" />
          </div>
          <p className="mt-6 font-heading text-base tracking-widest text-accent/80">
            {siteConfig.tagline}
          </p>
        </div>

        {/* 向下滚动提示 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs tracking-widest text-text-muted">SCROLL</span>
            <div className="h-8 w-[1px] animate-pulse bg-accent/40" />
          </div>
        </div>
      </section>

      {/* Timeline Section - 时间线占位区 */}
      <section className="bg-bg-dark py-20">
        <div className="mx-auto max-w-[var(--width-page)] px-6">
          <div className="mb-12 text-center">
            <p className="font-display text-sm italic tracking-[0.3em] text-accent/60">TIMELINE</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold tracking-wide text-text-primary md:text-3xl">
              重要时刻
            </h2>
            <div className="mx-auto mt-4 w-12">
              <div className="gold-line" />
            </div>
          </div>

          {/* 时间线占位 */}
          <div className="flex flex-col items-center gap-8 py-12">
            {[2025, 2022, 2014, 1994].map((year) => (
              <div key={year} className="flex items-center gap-6">
                <span className="font-display text-3xl italic text-accent/30">{year}</span>
                <div className="h-[1px] w-8 bg-accent/20" />
                <div className="rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/50 px-6 py-3">
                  <p className="text-sm text-text-muted">时间线节点（建设中）</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Nav Section - 栏目快捷入口 */}
      <section className="border-t border-border-gold bg-bg-darker py-20">
        <div className="mx-auto max-w-[var(--width-page)] px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NAV_ITEMS.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-[var(--radius-card)] border border-border-gold bg-bg-dark/30 p-6 transition-all duration-200 hover:border-accent/60 hover:bg-bg-dark/60"
              >
                <p className="font-heading text-lg text-text-primary transition-colors group-hover:text-accent">
                  {item.label}
                </p>
                <p className="mt-1 font-display text-xs italic tracking-widest text-text-muted">
                  {item.labelEn}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
