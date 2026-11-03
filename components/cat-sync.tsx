'use client';

import { useLayoutEffect } from 'react';

import { catState } from '../lib/time';

function applyCatState() {
  const state = catState(new Date());
  document.documentElement.dataset.cat = state;
  const cat = document.getElementById('site-cat');
  if (cat) cat.dataset.state = state;
}

export function CatSync() {
  useLayoutEffect(() => {
    applyCatState();
    const id = window.setInterval(applyCatState, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return null;
}
