'use client';

import { useLayoutEffect } from 'react';
import { catState } from '../lib/time';

export function CatSync() {
  useLayoutEffect(() => {
    const state = catState(new Date());
    document.documentElement.dataset.cat = state;
    const cat = document.getElementById('site-cat');
    if (cat) cat.dataset.state = state;
  }, []);
  return null;
}
