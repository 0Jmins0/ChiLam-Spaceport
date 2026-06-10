'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
  label: string;
  className?: string;
}

export function BackButton({ label, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={
        className || 'inline-block text-sm text-accent hover:text-accent/80 transition-colors'
      }
    >
      ← {label}
    </button>
  );
}
