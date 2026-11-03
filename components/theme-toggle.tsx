'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

type Choice = 'auto' | 'light' | 'dark';

const order: Choice[] = ['auto', 'light', 'dark'];

function resolve(choice: Choice): 'light' | 'dark' {
  if (choice === 'dark') return 'dark';
  if (choice === 'light') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function apply(choice: Choice) {
  const theme = resolve(choice);
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.themeChoice = choice;
  root.style.colorScheme = theme;
  localStorage.setItem('theme', choice);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0f0f0f' : '#fcfcfc');
}

function readChoice(): Choice {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  return 'auto';
}

export function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>('auto');
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const next = readChoice();
    setChoice(next);
    apply(next);
    setReady(true);
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readChoice() === 'auto') apply('auto');
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return (
    <button
      type="button"
      className="theme-toggle"
      data-hydrated={ready ? 'true' : 'false'}
      aria-label={`Theme: ${choice}`}
      onClick={() => {
        const next = order[(order.indexOf(choice) + 1) % order.length] ?? 'auto';
        setChoice(next);
        apply(next);
      }}
    >
      <svg
        className="theme-icon"
        data-theme-icon={choice}
        viewBox="0 0 16 16"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {choice === 'auto' ? (
          <>
            <circle cx="8" cy="8" r="5.5" />
            <path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="currentColor" stroke="none" />
          </>
        ) : choice === 'light' ? (
          <>
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1v1M8 14v1M1 8h1M14 8h1M3 3l.75.75M12.25 12.25 13 13M3 13l.75-.75M12.25 3.75 13 3" />
          </>
        ) : (
          <path d="M13.5 9.1A5.7 5.7 0 0 1 6.9 2.5a5.7 5.7 0 1 0 6.6 6.6Z" />
        )}
      </svg>
    </button>
  );
}
