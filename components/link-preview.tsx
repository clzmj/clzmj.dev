'use client';

import { useState } from 'react';

import type { ProfileLink } from '../lib/profile';

export function LinkPreview({ link }: { link: ProfileLink }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="preview-wrap">
      <a
        href={link.href}
        rel="noreferrer"
        target="_blank"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <Logo name={link.logo} />
        {link.label}
        <span className="visually-hidden"> (opens in a new tab)</span>
      </a>
      {open ? (
        <span className="link-preview" data-slot="link-preview">
          {link.previews.slice(0, 2).map((src, index) => (
            <span
              key={src}
              className={index === 0 ? 'preview-card preview-left' : 'preview-card preview-right'}
            >
              <img src={src} alt="" width={128} height={160} />
            </span>
          ))}
        </span>
      ) : null}
    </span>
  );
}

function Logo({ name }: { name: ProfileLink['logo'] }) {
  if (name === 'plus') {
    return (
      <svg className="org-logo" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 1.5v11M1.5 7h11" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (name === 'wave') {
    return (
      <svg className="org-logo" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M1 9c2-4 4 4 6 0s4 4 6 0" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg className="org-logo" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" />
    </svg>
  );
}
