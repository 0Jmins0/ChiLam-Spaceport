interface PageHeaderProps {
  title: string;
  titleEn?: string;
  description?: string;
}

export function PageHeader({ title, titleEn, description }: PageHeaderProps) {
  return (
    <div className="mb-12">
      <h1 className="font-heading text-3xl font-semibold tracking-wide text-text-primary md:text-4xl">
        {title}
      </h1>
      {titleEn && (
        <p className="mt-1 font-display text-sm italic tracking-widest text-text-muted">
          {titleEn}
        </p>
      )}
      {description && <p className="mt-3 text-sm text-text-secondary">{description}</p>}
      <div className="gold-line mt-6 w-full" />
    </div>
  );
}
