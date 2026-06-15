'use client';

import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/cn';

interface MarkdownContentProps {
  content: string | null | undefined;
  className?: string;
}

export default function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content) return null;

  // Preserve line breaks for plain text: convert single newlines to double
  // so react-markdown renders them as separate paragraphs
  const processed = content.replace(/(?<!\n)\n(?!\n)/g, '  \n');

  return (
    <div className={cn('prose prose-invert prose-sm max-w-none text-text-secondary', className)}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => (
            <strong className="text-text-primary font-semibold">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => <ul className="mb-3 ml-4 list-disc space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="mb-3 ml-4 list-decimal space-y-1">{children}</ol>,
          h1: ({ children }) => (
            <h1 className="mb-4 text-2xl font-bold text-text-primary">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mb-3 text-xl font-bold text-text-primary">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 text-lg font-semibold text-text-primary">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-accent pl-4 italic text-text-muted">
              {children}
            </blockquote>
          ),
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
