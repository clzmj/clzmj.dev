import type { ReactNode } from 'react';

export function ItemRow({
  href,
  icon,
  title,
  meta,
  badge,
  external,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  meta: string;
  badge?: string;
  external?: boolean;
}) {
  return (
    <a className="row" href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {icon}
      <span className="row-main">
        <span className="row-title">{title}</span>
        {badge ? <span className="badge">{badge}</span> : null}
      </span>
      <span className="row-meta">{meta}</span>
    </a>
  );
}

export function NoteIcon() {
  return (
    <span className="note-icon" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export function DateChip({ month, day }: { month: string; day: string }) {
  return (
    <span className="date-chip" aria-hidden="true">
      <span>{month}</span>
      <span>{day}</span>
    </span>
  );
}
