'use client';

import { useState } from 'react';

export function Dog({ running = false }: { running?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const state = running || hovered || focused ? 'running' : 'idle';
  return (
    <button
      className="dog-anchor"
      type="button"
      aria-label="Play with Bingo"
      title="Bingo, a red merle border collie"
      onPointerEnter={(event) => setHovered(event.pointerType !== 'touch')}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onClick={(event) => event.currentTarget.focus()}
    >
      <span className="dog" id="site-dog" data-state={state} aria-hidden="true" />
    </button>
  );
}
