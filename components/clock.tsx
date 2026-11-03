'use client';

import { useEffect, useState } from 'react';
import { formatClock } from '../lib/time';

export function Clock({ initial, initialIso }: { initial: string; initialIso: string }) {
  const [label, setLabel] = useState(initial);
  const [iso, setIso] = useState(initialIso);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setLabel(formatClock(now));
      setIso(now.toISOString());
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {label}
    </time>
  );
}
