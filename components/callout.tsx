import type { ReactNode } from 'react';

export function Callout({ children }: { children: ReactNode }) {
  return (
    <aside className="callout">
      <p className="callout-label">Note</p>
      <div>{children}</div>
    </aside>
  );
}
