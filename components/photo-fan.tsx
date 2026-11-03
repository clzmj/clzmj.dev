'use client';

import { useEffect, useRef, useState } from 'react';
import type { Slide } from '../lib/content';

export function PhotoFan({ photos }: { photos: Slide[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const center = (photos.length - 1) / 2;
  const photo = open === null ? null : photos[open];
  return (
    <>
      <div className="photo-eventail">
        <div className="photo-piste">
          {photos.map((item, index) => {
            const offset = index - center;
            const arc = ((0.6 * offset * offset) / 168) * 100;
            return (
              <button
                key={item.src}
                type="button"
                className="fan-card"
                style={{
                  left: `calc(50% + var(--u) * ${offset * 80 - 68})`,
                  ['--fan-y' as string]: `${arc}%`,
                  ['--fan-r' as string]: `${offset * 3}deg`,
                  ['--fan-i' as string]: String(index),
                }}
                aria-label={item.caption}
                onClick={() => setOpen(index)}
              >
                <img src={item.src} alt="" width={128} height={160} />
              </button>
            );
          })}
        </div>
      </div>
      {photo ? <PhotoDialog photo={photo} onClose={() => setOpen(null)} /> : null}
    </>
  );
}

function PhotoDialog({ photo, onClose }: { photo: Slide; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    const onCancel = (event: Event) => {
      event.preventDefault();
      closeRef.current();
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) closeRef.current();
    };
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('click', onClick);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('click', onClick);
      if (dialog.open) dialog.close();
    };
  }, []);
  return (
    <dialog ref={ref} className="photo-dialog" aria-label={photo.caption}>
      <button type="button" className="photo-close" aria-label="Close photo" onClick={onClose}>
        <svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true">
          <path
            d="M3 3l8 8M11 3l-8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <figure className="photo-frame">
        <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
        <figcaption>{photo.caption}</figcaption>
      </figure>
    </dialog>
  );
}
