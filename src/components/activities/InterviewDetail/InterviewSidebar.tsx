import Link from 'next/link';

interface InterviewSidebarProps {
  source: string | null;
  host: string | null;
  location: string | null;
  date: Date;
  duration: string | null;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function MetaValue({ value }: { value: string | null }) {
  if (value) {
    return <p className="text-base text-text-primary">{value}</p>;
  }
  return <p className="text-base text-text-muted italic">暂无</p>;
}

const SourceIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    className="text-accent shrink-0"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 2v4M10 14v4M2 10h4M14 10h4" />
    <circle cx="10" cy="10" r="3" />
    <path d="M4.5 4.5l2 2M13.5 13.5l2 2M4.5 15.5l2-2M13.5 6.5l2-2" />
  </svg>
);

const HostIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    className="text-accent shrink-0"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="8" y="2" width="4" height="8" rx="2" />
    <path d="M5 9a5 5 0 0 0 10 0" />
    <path d="M10 14v4M7 18h6" />
  </svg>
);

const LocationIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    className="text-accent shrink-0"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 18s-6-5.34-6-9a6 6 0 1 1 12 0c0 3.66-6 9-6 9z" />
    <circle cx="10" cy="9" r="2" />
  </svg>
);

const DateIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    className="text-accent shrink-0"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="14" height="14" rx="2" />
    <path d="M3 8h14M7 2v4M13 2v4" />
  </svg>
);

const DurationIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    className="text-accent shrink-0"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6v4l3 2" />
  </svg>
);

interface MetaItemProps {
  icon: React.ReactNode;
  labelCn: string;
  labelEn: string;
  children: React.ReactNode;
}

function MetaItem({ icon, labelCn, labelEn, children }: MetaItemProps) {
  return (
    <div className="flex gap-3 py-4 border-b border-border-gold/20 last:border-b-0">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-accent">{labelCn}</p>
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{labelEn}</p>
        {children}
      </div>
    </div>
  );
}

export default function InterviewSidebar({
  source,
  host,
  location,
  date,
  duration,
}: InterviewSidebarProps) {
  return (
    <div>
      {/* Desktop: vertical list / Mobile: 2-col grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-0 lg:grid-cols-1 lg:gap-0">
        <MetaItem icon={<SourceIcon />} labelCn="来源" labelEn="SOURCE">
          <MetaValue value={source} />
        </MetaItem>

        <MetaItem icon={<HostIcon />} labelCn="主持" labelEn="HOST">
          <MetaValue value={host} />
        </MetaItem>

        <MetaItem icon={<LocationIcon />} labelCn="地点" labelEn="LOCATION">
          <MetaValue value={location} />
        </MetaItem>

        <MetaItem icon={<DateIcon />} labelCn="日期" labelEn="DATE">
          <p className="text-base text-text-primary">{formatDate(date)}</p>
        </MetaItem>

        <MetaItem icon={<DurationIcon />} labelCn="时长" labelEn="DURATION">
          <MetaValue value={duration} />
        </MetaItem>
      </div>

      {/* Back button */}
      <div className="mt-6 col-span-2">
        <Link
          href="/activities?tab=interview"
          className="inline-flex items-center gap-2 border border-border-gold rounded-[var(--radius-card)] px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent hover:text-text-primary"
        >
          <span>&larr;</span>
          <span>
            返回活动 / <span className="uppercase tracking-wider text-xs">Back to Activities</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
