'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { Slide } from '../lib/content';

export function PhotoFan({ photos }: { photos: Slide[] }) {
  const [open, setOpen] = useState<{ index: number; source: HTMLButtonElement } | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const rows = Array.from({ length: Math.ceil(photos.length / 7) }, (_, index) =>
    photos.slice(index * 7, index * 7 + 7),
  );
  const photo = open === null ? null : photos[open.index];
  const closeDialog = useCallback(() => setOpen(null), []);
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
        <PhotoDialog photo={photo} source={open?.source ?? null} onClose={closeDialog} />
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
    const trigger = source;
    const html = document.documentElement;
    const body = document.body;
    const previous = {
      html: html.getAttribute('style'),
      body: body.getAttribute('style'),
      x: scrollX,
      y: scrollY,
    };
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const token = crypto.randomUUID();
    let ownsHistory = true;
    let released = false;
    let closing = false;
    let finished = false;
    let closeAnimationStarted = false;
    let animation: Animation | undefined;
    let pointer: { id: number; x: number; y: number } | null = null;

    function restore() {
      if (released) return;
      released = true;
      for (const [element, style] of [
        [html, previous.html],
        [body, previous.body],
      ] as const) {
        if (style === null) element.removeAttribute('style');
        else element.setAttribute('style', style);
      }
      window.scrollTo({ left: previous.x, top: previous.y, behavior: 'instant' });
      requestAnimationFrame(() => trigger.focus({ preventScroll: true }));
    }
    function popOwnHistory() {
      if (ownsHistory && history.state?.photoViewer === token) {
        ownsHistory = false;
        history.back();
      }
    }
    function sourceTransform() {
      const start = trigger.getBoundingClientRect();
      const end = frame!.getBoundingClientRect();
      const matrix = new DOMMatrixReadOnly(getComputedStyle(trigger).transform);
      const scale = Math.hypot(matrix.a, matrix.b);
      const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
      const x = start.x + start.width / 2 - (end.x + end.width / 2);
      const y = start.y + start.height / 2 - (end.y + end.height / 2);
      return `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${(trigger.offsetWidth * scale) / end.width}, ${(trigger.offsetHeight * scale) / end.height})`;
    }
    // Every user/native close path enters here; finalization and unmount share restore().
    function close({ fromHistory = false, immediate = false } = {}) {
      if (finished) return;
      if (!closing) {
        closing = true;
        if (!fromHistory) popOwnHistory();
      }
      if (immediate || reducedMotion.matches || !dialog!.open) {
        finished = true;
        animation?.cancel();
        if (dialog!.open) dialog!.close();
        restore();
        onClose();
        return;
      }
      if (closeAnimationStarted) return;
      closeAnimationStarted = true;
      const currentTransform = getComputedStyle(frame!).transform;
      animation?.cancel();
      const style = getComputedStyle(dialog!);
      const durationValue = style.getPropertyValue('--photo-close-duration').trim();
      const duration = Number.parseFloat(durationValue) * (durationValue.endsWith('ms') ? 1 : 1000);
      getComputedStyle(dialog!, '::backdrop').getPropertyValue('opacity');
      dialog!.dataset.closing = 'true';
      animation = frame!.animate(
        [{ transform: currentTransform }, { transform: sourceTransform() }],
        {
          duration,
          easing: style.getPropertyValue('--photo-close-easing').trim(),
          fill: 'forwards',
        },
      );
    }
    closeRef.current = close;
    const onCancel = (event: Event) => {
      event.preventDefault();
      close();
    };
    const onNativeClose = () => close({ immediate: true });
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) close();
    };
    const onPopState = () => {
      if (history.state?.photoViewer === token) return;
      ownsHistory = false;
      close({ fromHistory: true });
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (closing && event.pseudoElement === '::backdrop' && event.propertyName === 'opacity')
        close({ fromHistory: true, immediate: true });
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' && event.isPrimary)
        pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dy = event.clientY - pointer.y;
      const dx = event.clientX - pointer.x;
      pointer = null;
      if (dy > 64 && dy > Math.abs(dx) * 1.2) close();
    };
    const onPointerCancel = () => {
      pointer = null;
    };
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('close', onNativeClose);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('transitionend', onTransitionEnd);
    dialog.addEventListener('pointerdown', onPointerDown);
    dialog.addEventListener('pointerup', onPointerUp);
    dialog.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('popstate', onPopState);
    html.style.setProperty('overflow', 'hidden', 'important');
    dialog.showModal();
    history.pushState({ ...history.state, photoViewer: token }, '', location.href);
    if (!reducedMotion.matches) {
      animation = frame.animate([{ transform: sourceTransform() }, { transform: 'none' }], {
        duration: 420,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      });
    }
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('close', onNativeClose);
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('transitionend', onTransitionEnd);
      dialog.removeEventListener('pointerdown', onPointerDown);
      dialog.removeEventListener('pointerup', onPointerUp);
      dialog.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('popstate', onPopState);
      animation?.cancel();
      popOwnHistory();
      if (dialog.open) dialog.close();
      restore();
    };
  }, [source, onClose]);
  return (
    <dialog ref={ref} className="photo-dialog" aria-label={photo.caption}>
      <button
        type="button"
        className="sr-only"
        aria-label="Close photo"
        onClick={() => closeRef.current()}
      >
        Close photo
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
