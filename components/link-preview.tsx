'use client';

import { useState } from 'react';

import type { ProfileLink } from '../lib/profile';

export function LinkPreview({ link }: { link: ProfileLink }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="preview-wrap">
      <a
        className="bio-text-link"
        href={link.href}
        rel="noreferrer"
        target="_blank"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {link.label}
        <span className="visually-hidden"> (opens in a new tab)</span>
      </a>
      {open && !!link.previews?.length ? (
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
