import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-dark text-center">
      <p className="font-display text-8xl italic text-accent/20">404</p>
      <h1 className="mt-4 font-heading text-2xl text-text-primary">页面未找到</h1>
      <p className="mt-2 text-sm text-text-muted">Page Not Found</p>
      <div className="mx-auto mt-6 w-12">
        <div className="gold-line" />
      </div>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-button)] border border-accent px-6 py-2.5 text-sm text-accent transition-all hover:bg-accent/10"
      >
        返回首页
      </Link>
    </main>
  );
}
