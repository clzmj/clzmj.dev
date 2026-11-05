'use client';

import { useEffect, useState } from 'react';

export function Clock() {
  const [time, setTime] = useState({ label: '--:--:--', iso: '' });
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
    let timeout = 0;
    const resync = () => {
      window.clearTimeout(timeout);
      if (document.hidden) return;
      const now = new Date();
      setTime({ label: format.format(now), iso: now.toISOString() });
      timeout = window.setTimeout(resync, 1000 - (now.getTime() % 1000));
    };
    document.addEventListener('visibilitychange', resync);
    resync();
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('visibilitychange', resync);
    };
  }, []);
  return (
    <time
      className="footer-time is-ready"
      dateTime={time.iso || undefined}
      suppressHydrationWarning
    >
      {`${time.label} in Mexico City`}
    </time>
  );
}
