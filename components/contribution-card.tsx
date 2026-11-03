'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ContributionDay, Contributions } from '../lib/contributions';
import { site } from '../lib/site';

export function ContributionCard({ data }: { data: Contributions }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || node.scrollWidth <= node.clientWidth) return;
    node.scrollLeft = node.scrollWidth;
  }, []);
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
        text: tipText({ date, level: Number(cell.dataset.level ?? '0') }),
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
          <div className="contrib-grid">
            {data.weeks.flatMap((week) =>
              week.map((day) => (
                <span
                  key={day.date}
                  className={`contrib-cell level-${day.level}`}
                  data-date={day.date}
                  data-level={day.level}
                />
              )),
            )}
          </div>
        </div>
        {tip ? (
          <div
            className="contrib-tip"
            style={{ left: tip.x, top: tip.y }}
            data-slot="contribution-tip"
          >
            {tip.text}
          </div>
        ) : null}
        <div className="contrib-head">
          <p>
            <a href={site.github} rel="noreferrer" target="_blank">
              {total} contributions
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>{' '}
            in the last year
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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, date)));
  if (day.level === 0) return `No contributions on ${label}`;
  return `Contributions on ${label}`;
}
