'use client';

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- A CSS sprite needs role=img to expose its current background frame. */

import { useState } from 'react';

const name = "Bingo, Carlos's border collie";

export function Bingo() {
  const [running, setRunning] = useState(false);
  const run = () => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setRunning(true);
  };
  return (
    <button
      className="bingo-slot"
      type="button"
      aria-label={name}
      title={name}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') run();
      }}
      onFocus={run}
      onClick={run}
    >
      <span
        className="bingo"
        id="profile-bingo"
        role="img"
        aria-label={name}
        data-state={running ? 'running' : 'idle'}
        onAnimationEnd={(event) => {
          if (event.animationName === 'bingo-run') setRunning(false);
        }}
      />
    </button>
  );
}
