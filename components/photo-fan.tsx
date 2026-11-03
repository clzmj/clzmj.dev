'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import type { Slide } from '../lib/content';

export function PhotoFan({ photos }: { photos: Slide[] }) {
  const [open, setOpen] = useState<{ index: number; source: HTMLButtonElement } | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const rows = Array.from({ length: Math.ceil(photos.length / 7) }, (_, index) =>
    photos.slice(index * 7, index * 7 + 7),
  );
  const photo = open === null ? null : photos[open.index];
  return (
    <>
      <div className="photo-eventail">
        {rows.map((row, rowIndex) => (
          <div className="photo-fan-row" key={row[0].src}>
            <div className="photo-piste">
              {row.map((item, column) => {
                const index = rowIndex * 7 + column;
                const offset = column - (row.length - 1) / 2;
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
                      ['--fan-i' as string]: String(column),
                    }}
                    aria-label={item.caption}
                    aria-expanded={open?.index === index}
                    onPointerEnter={() => setActive(index)}
                    onPointerLeave={(event) => {
                      if (document.activeElement !== event.currentTarget) setActive(null);
                    }}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    onClick={(event) => setOpen({ index, source: event.currentTarget })}
                  >
                    <PhotoImage photo={item} />
                  </button>
                );
              })}
            </div>
            <p className="fan-caption" data-slot="fan-caption">
              {active !== null && Math.floor(active / 7) === rowIndex
                ? photos[active].caption
                : '\u00a0'}
            </p>
          </div>
        ))}
      </div>
      {photo ? (
        <PhotoDialog photo={photo} source={open?.source ?? null} onClose={() => setOpen(null)} />
      ) : null}
    </>
  );
}

function PhotoDialog({
  photo,
  source,
  onClose,
}: {
  photo: Slide;
  source: HTMLButtonElement | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLElement>(null);
  const closeRef = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    const dialog = ref.current;
    const frame = frameRef.current;
    if (!dialog || !frame || !source) return;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let animation: Animation | undefined;
    let closing = false;
    function sourceTransform() {
      const start = source!.getBoundingClientRect();
      const end = frame!.getBoundingClientRect();
      const matrix = new DOMMatrixReadOnly(getComputedStyle(source!).transform);
      const scale = Math.hypot(matrix.a, matrix.b);
      const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      const x = start.x + start.width / 2 - (end.x + end.width / 2);
      const y = start.y + start.height / 2 - (end.y + end.height / 2);
      return `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${(source!.offsetWidth * scale) / end.width}, ${(source!.offsetHeight * scale) / end.height})`;
    }
    const start = sourceTransform();
    if (!reducedMotion.matches) {
      animation = frame.animate([{ transform: start }, { transform: 'none' }], {
        duration: 420,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
    }
    closeRef.current = () => {
      if (closing) return;
      closing = true;
      const currentTransform = getComputedStyle(frame).transform;
      animation?.cancel();
      if (reducedMotion.matches) {
        onClose();
        return;
      }
      const style = getComputedStyle(dialog);
      const durationValue = style.getPropertyValue('--photo-close-duration').trim();
      const duration = Number.parseFloat(durationValue) * (durationValue.endsWith('ms') ? 1 : 1000);
      const easing = style.getPropertyValue('--photo-close-easing').trim();
      // Establish the visible backdrop before changing its transition target.
      getComputedStyle(dialog, '::backdrop').getPropertyValue('opacity');
      dialog.dataset.closing = 'true';
      animation = frame.animate(
        [{ transform: currentTransform }, { transform: sourceTransform() }],
        {
          duration,
          easing,
          fill: 'forwards',
        },
      );
    };
    const onCancel = (event: Event) => {
      event.preventDefault();
      closeRef.current();
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) closeRef.current();
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (closing && event.pseudoElement === '::backdrop' && event.propertyName === 'opacity') {
        onClose();
      }
    };
    dialog.addEventListener('transitionend', onTransitionEnd);
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('click', onClick);
    return () => {
      animation?.cancel();
      document.body.style.overflow = overflow;
      dialog.removeEventListener('transitionend', onTransitionEnd);
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('click', onClick);
      dialog.close();
      requestAnimationFrame(() => source.focus({ preventScroll: true }));
    };
  }, [source, onClose]);
  return (
    <dialog ref={ref} className="photo-dialog" aria-label={photo.caption}>
      <button
        type="button"
        className="photo-close"
        aria-label="Close photo"
        onClick={() => closeRef.current()}
      >
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
      <figure ref={frameRef} className="photo-frame">
        <PhotoImage photo={photo} full />
        <figcaption>{photo.caption}</figcaption>
      </figure>
    </dialog>
  );
}

function PhotoImage({ photo, full = false }: { photo: Slide; full?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useLayoutEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <span className="photo-image" style={{ backgroundColor: photo.color }} data-loaded={loaded}>
      <img
        ref={ref}
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={
          full ? '(max-width: 640px) calc(100vw - 48px), 520px' : '(max-width: 640px) 20vw, 128px'
        }
        alt={photo.caption}
        width={photo.width}
        height={photo.height}
        loading={full ? 'eager' : 'lazy'}
        decoding="async"
        style={{ objectPosition: photo.objectPosition }}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}
