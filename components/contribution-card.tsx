'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { ContributionDay, Contributions } from '../lib/contributions';
import { site } from '../lib/site';

export function ContributionCard({ data }: { data: Contributions }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const sources = data.sources ?? ['github'];
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || node.scrollWidth <= node.clientWidth) return;
    node.scrollLeft = node.scrollWidth;
  }, []);
  useLayoutEffect(() => {
    if (!tip || !tipRef.current || !cardRef.current) return;
    const halfWidth = tipRef.current.getBoundingClientRect().width / 2;
    const cardWidth = cardRef.current.getBoundingClientRect().width;
    const x = Math.max(halfWidth + 8, Math.min(tip.x, cardWidth - halfWidth - 8));
    if (x !== tip.x) setTip({ ...tip, x });
  }, [tip]);
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const onOver = (event: MouseEvent) => {
      const cell = (event.target as HTMLElement | null)?.closest?.('[data-date]');
      const card = cardRef.current;
      if (!(cell instanceof HTMLElement) || !card || !node.contains(cell)) return;
      const date = cell.dataset.date;
      if (!date) return;
      const rect = cell.getBoundingClientRect();
      const parent = card.getBoundingClientRect();
      setTip({
        text: tipText({
          date,
          level: Number(cell.dataset.level ?? '0'),
          count: cell.dataset.count === undefined ? undefined : Number(cell.dataset.count),
          github: cell.dataset.github === undefined ? undefined : Number(cell.dataset.github),
          gitlab: cell.dataset.gitlab === undefined ? undefined : Number(cell.dataset.gitlab),
        }),
        x: rect.left + rect.width / 2 - parent.left,
        y: rect.top - parent.top,
      });
    };
    const onLeave = () => setTip(null);
    node.addEventListener('mouseover', onOver);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mouseover', onOver);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, []);
  const total = data.total.toLocaleString('en-US');
  return (
    <div className="contrib-outer">
      <div className="contrib" ref={cardRef}>
        <div className="contrib-scroll" ref={scrollRef}>
          <ul className="contrib-grid" aria-label="Daily contributions">
            {data.weeks.flatMap((week) =>
              week.map((day) => (
                <li
                  key={day.date}
                  className={`contrib-cell level-${day.level}`}
                  aria-label={tipText(day)}
                  data-date={day.date}
                  data-level={day.level}
                  data-count={day.count}
                  data-github={day.github}
                  data-gitlab={day.gitlab}
                />
              )),
            )}
          </ul>
        </div>
        {tip ? (
          <div
            className="contrib-tip"
            ref={tipRef}
            style={{ left: tip.x, top: tip.y }}
            data-slot="contribution-tip"
            role="tooltip"
          >
            {tip.text}
          </div>
        ) : null}
        <div className="contrib-head">
          <p className="contrib-summary">
            <span>{total} contributions in the last year</span>
            <span className="contrib-sources">
              {sources.map((source, index) => (
                <span key={source}>
                  {index > 0 ? ' + ' : null}
                  <a
                    href={source === 'github' ? site.github : 'https://gitlab.com/clzmj'}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {source === 'github' ? 'GitHub' : 'GitLab'}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                </span>
              ))}
            </span>
          </p>
          <p className="contrib-legend" aria-hidden="true">
            Less
            <span className="contrib-cell level-0" />
            <span className="contrib-cell level-1" />
            <span className="contrib-cell level-2" />
            <span className="contrib-cell level-3" />
            <span className="contrib-cell level-4" />
            More
          </p>
        </div>
      </div>
    </div>
  );
}

function tipText(day: ContributionDay): string {
  const [year, month, date] = day.date.split('-').map(Number);
  const label = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, date)));
  const counts = [
    day.github === undefined ? null : `${day.github} GitHub`,
    day.gitlab === undefined ? null : `${day.gitlab} GitLab`,
  ].filter((count) => count !== null);
  const suffix = counts.length ? ` (${counts.join(', ')})` : '';
  if (day.count === 0 || day.level === 0) return `No contributions on ${label}${suffix}`;
  return (
    (day.count === undefined
      ? `Contributions on ${label}`
      : `${day.count} ${day.count === 1 ? 'contribution' : 'contributions'} on ${label}`) + suffix
  );
}
