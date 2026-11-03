import type { ReactNode } from 'react';

import { formatClock } from '../lib/time';
import { Cat } from './cat';
import { Clock } from './clock';
import { ThemeToggle } from './theme-toggle';

export function Shell({
  markdownHref,
  children,
  awakeCat = false,
}: {
  markdownHref: string;
  children: ReactNode;
  awakeCat?: boolean;
}) {
  const label = markdownHref.split('/').pop() ?? 'index.md';
  const now = new Date();
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <main id="content" className="shell">
        {children}
        <footer
          className="footer animate-enter animate-enter-individual"
          style={{ ['--stagger' as string]: 6 }}
        >
          <p className="footer-clock">
            <Clock initial={formatClock(now)} initialIso={now.toISOString()} />
            <Cat awake={awakeCat} />
          </p>
          <div className="footer-actions">
            <ThemeToggle />
            <a className="footer-link" href={markdownHref}>
              {label}
            </a>
          </div>
        </footer>
      </main>
    </>
  );
}
