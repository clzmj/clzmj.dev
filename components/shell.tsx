import type { ReactNode } from 'react';

import { Clock } from './clock';
import { FooterSocialLinks } from './footer-social-links';
import { ThemeToggle } from './theme-toggle';

export function Shell({ markdownHref, children }: { markdownHref: string; children: ReactNode }) {
  const label = markdownHref.split('/').pop() ?? 'index.md';
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
            <Clock />
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
