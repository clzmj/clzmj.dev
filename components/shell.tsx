import type { ReactNode } from 'react';
import { Cat } from './cat';
import { ThemeToggle } from './theme-toggle';

export function Shell({
  markdownHref,
  pill,
  children,
}: {
  markdownHref: string;
  pill?: boolean;
  children: ReactNode;
}) {
  const label = markdownHref.split('/').pop() ?? 'index.md';
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <main id="content" className={pill ? 'shell shell-pill' : 'shell'}>
        {children}
        <footer className="footer">
          <Cat />
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
