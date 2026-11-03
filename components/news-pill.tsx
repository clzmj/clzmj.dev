'use client';

import { useEffect, useState } from 'react';

export function NewsPill({ href, title }: { href: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setOpen(true), reduced ? 0 : 200);
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);
  const collapsed = !open || scrolled;
  return (
    <div className="news-anchor">
      <a
        className={collapsed ? 'news-pill is-collapsed' : 'news-pill is-open'}
        href={href}
        inert={scrolled ? true : undefined}
        tabIndex={scrolled ? -1 : undefined}
      >
        <span className="news-chip">New</span>
        <span className="news-title">{title}</span>
        <span className="news-arrow" aria-hidden="true">
          <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
            <path
              d="M3 7h8M8 3.5 11.5 7 8 10.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </a>
    </div>
  );
}
