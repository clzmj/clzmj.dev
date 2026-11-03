'use client';

import { useEffect, useLayoutEffect, useState } from 'react';

type Choice = 'auto' | 'light' | 'dark';

const order: Choice[] = ['auto', 'light', 'dark'];
const labels: Record<Choice, string> = { auto: 'Auto', light: 'Light', dark: 'Dark' };

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
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#111111' : '#f4f4f2');
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
      aria-label={`Color theme: ${choice}. Activate to change.`}
      onClick={() => {
        const next = order[(order.indexOf(choice) + 1) % order.length] ?? 'auto';
        setChoice(next);
        apply(next);
      }}
    >
      {labels[choice]}
    </button>
  );
}
