import type { Metadata } from 'next';
import { fontVariables } from '@/lib/fonts';
import { siteConfig } from '@/config/site';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FilmGrain } from '@/components/decorative/FilmGrain';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} ${siteConfig.nameCn}`,
    template: `%s | ${siteConfig.nameCn}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={fontVariables}>
      <body className="min-h-screen bg-bg-dark font-body text-text-primary antialiased">
        <FilmGrain />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
