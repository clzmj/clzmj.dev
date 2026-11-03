import type { ReactNode } from 'react';

import { formatClock } from '../lib/time';
import { Clock } from './clock';
import { FooterSocialLinks } from './footer-social-links';
import { ThemeToggle } from './theme-toggle';

export function Shell({ markdownHref, children }: { markdownHref: string; children: ReactNode }) {
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
          </p>
          <div className="footer-actions">
            <FooterSocialLinks />
            <ThemeToggle />
          </div>
          <a className="footer-link" href={markdownHref}>
            {label}
          </a>
        </footer>
      </main>
    </>
  );
}
