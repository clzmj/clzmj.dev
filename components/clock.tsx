'use client';

import { useEffect, useState } from 'react';
import { formatClock } from '../lib/time';

export function Clock({ initial, initialIso }: { initial: string; initialIso: string }) {
  const [label, setLabel] = useState(initial);
  const [iso, setIso] = useState(initialIso);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLabel(formatClock(now));
      setIso(now.toISOString());
    };
    update();
    setReady(true);
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time
      className={ready ? 'footer-time is-ready' : 'footer-time'}
      dateTime={iso}
      suppressHydrationWarning
    >
      {label}
    </time>
  );
}
