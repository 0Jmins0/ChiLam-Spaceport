'use client';

import { cn } from '@/lib/cn';

interface GlassOverlayProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export function GlassOverlay({ open, onClose, children, className }: GlassOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-bg-dark/70 backdrop-blur-sm" onClick={onClose} />
      {/* Content */}
      <div
        className={cn(
          'relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[var(--radius-card)] border border-border-gold glass p-6',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
