'use client';

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';

import type { Slide } from '../lib/content';
import { orderedPhotos, shuffleScript } from '../lib/elsewhere-shuffle';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  type DialogActions,
  type DialogChangeDetails,
} from './ui/dialog';

const glide = { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

export function PhotoFan({ photos }: { photos: Slide[] }) {
  const [displayed, setDisplayed] = useState(photos);
  const [adopted, setAdopted] = useState(false);
  const [selected, setSelected] = useState<{ index: number; tilt: number } | null>(null);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const actions = useRef<DialogActions | null>(null);
  const historyEntry = useRef<string | null>(null);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const group = useId();
  const reduced = useReducedMotion();
  const photo = selected ? orderedPhotos(photos)[selected.index] : null;
  const rows = Array.from({ length: Math.ceil(displayed.length / 7) }, (_, index) =>
    displayed.slice(index * 7, index * 7 + 7),
  );
  useEffect(() => {
    setDisplayed(orderedPhotos(photos));
    setAdopted(true);
  }, [photos]);
  useLayoutEffect(() => {
    if (adopted) document.getElementById('elsewhere-shuffle-style')?.remove();
  }, [adopted]);
  const popOwnEntry = useCallback(() => {
    const token = historyEntry.current;
    historyEntry.current = null;
    if (token && history.state?.photoViewer === token) history.back();
  }, []);
  useEffect(() => {
    if (!open) return;
    const back = () => {
      if (history.state?.photoViewer === historyEntry.current) return;
      historyEntry.current = null;
      actions.current?.close();
    };
    window.addEventListener('popstate', back);
    return () => window.removeEventListener('popstate', back);
  }, [open]);
  useEffect(() => () => popOwnEntry(), [popOwnEntry]);
  const changeOpen = (next: boolean, details: DialogChangeDetails) => {
    if (!next) {
      details.preventUnmountOnClose();
      popOwnEntry();
    }
    setOpen(next);
  };
  const finishExit = () => {
    actions.current?.unmount();
    setSelected(null);
  };
  const navigate = (direction: number) =>
    setSelected((value) =>
      value
        ? { ...value, index: (value.index + direction + photos.length) % photos.length }
        : value,
    );
  return (
    <LayoutGroup id={group}>
      <script
        id="elsewhere-shuffle"
        dangerouslySetInnerHTML={{ __html: shuffleScript(photos.map((item) => item.id)) }}
      />
      <div className="photo-eventail">
        {rows.map((row) => (
          <div className="photo-fan-row" key={row[0].id}>
            <div className="photo-piste">
              {row.map((item, column) => {
                const offset = column - (row.length - 1) / 2;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="fan-card"
                    data-photo-id={item.id}
                    aria-label={item.caption}
                    style={{
                      left: `calc(50% + var(--u) * ${offset * 80 - 68})`,
                      ['--fan-y' as string]: `${((0.6 * offset * offset) / 168) * 100}%`,
                      ['--fan-r' as string]: `${offset * 3}deg`,
                      ['--fan-i' as string]: String(column),
                    }}
                    onClick={(event) => {
                      trigger.current = event.currentTarget;
                      setSelected({
                        index: orderedPhotos(photos).findIndex((entry) => entry.id === item.id),
                        tilt: offset * 3,
                      });
                      if (!historyEntry.current) {
                        const token = crypto.randomUUID();
                        historyEntry.current = token;
                        history.pushState(
                          { ...history.state, photoViewer: token },
                          '',
                          location.href,
                        );
                      }
                      setOpen(true);
                    }}
                  >
                    <motion.div
                      className="photo-shared"
                      layoutId={reduced ? undefined : `photo-${item.id}`}
                      transition={glide}
                      data-shared-photo={item.id}
                    >
                      <PhotoImage photo={item} />
                    </motion.div>
                  </button>
                );
              })}
            </div>
            <div className="fan-captions">
              {row.map((item) => (
                <p key={item.id} className="fan-caption" data-slot="fan-caption">
                  {item.caption}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={changeOpen} actionsRef={actions}>
        <DialogPortal>
          <DialogOverlay
            render={
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: open ? 1 : 0 }}
                transition={reduced ? { duration: 0.12 } : glide}
              />
            }
          />
          <DialogContent
            finalFocus={trigger}
            aria-describedby={undefined}
            onKeyDown={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                navigate(event.key === 'ArrowRight' ? 1 : -1);
              }
            }}
            onPointerDown={(event) => {
              if (event.pointerType === 'touch' && event.isPrimary)
                pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            }}
            onPointerCancel={() => {
              pointer.current = null;
            }}
            onPointerUp={(event) => {
              const start = pointer.current;
              pointer.current = null;
              if (
                start &&
                start.id === event.pointerId &&
                event.clientY - start.y > 64 &&
                event.clientY - start.y > Math.abs(event.clientX - start.x) * 1.2
              )
                actions.current?.close();
            }}
          >
            <DialogTitle className="sr-only">{photo?.caption}</DialogTitle>
            <DialogClose className="sr-only" aria-label="Close photo">
              Close photo
            </DialogClose>
            <button
              type="button"
              className="sr-only"
              aria-label="Previous photo"
              onClick={() => navigate(-1)}
            >
              Previous photo
            </button>
            <button
              type="button"
              className="sr-only"
              aria-label="Next photo"
              onClick={() => navigate(1)}
            >
              Next photo
            </button>
            <AnimatePresence onExitComplete={finishExit}>
              {open && photo && (
                <motion.figure
                  key="viewer"
                  className="photo-frame"
                  layoutId={reduced ? undefined : `photo-${photo.id}`}
                  data-shared-photo={photo.id}
                  initial={reduced ? { opacity: 0 } : { opacity: 1, rotate: selected?.tilt ?? 0 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: selected?.tilt ?? 0 }}
                  transition={reduced ? { duration: 0.12 } : glide}
                >
                  <PhotoImage key={photo.id} photo={photo} full />
                  <figcaption>{photo.caption}</figcaption>
                </motion.figure>
              )}
            </AnimatePresence>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </LayoutGroup>
  );
}

function PhotoImage({ photo, full = false }: { photo: Slide; full?: boolean }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useLayoutEffect(() => {
    if (ref.current?.complete && ref.current.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <span
      className="photo-image"
      style={{
        backgroundColor: photo.color,
        aspectRatio: full && photo.id === '14' ? `${photo.width} / ${photo.height}` : undefined,
      }}
      data-loaded={loaded}
    >
      <img
        ref={ref}
        src={photo.src}
        srcSet={photo.srcSet}
        sizes={
          full ? '(max-width: 640px) calc(100vw - 48px), 520px' : '(max-width: 640px) 20vw, 128px'
        }
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading="lazy"
        decoding="async"
        style={{
          objectPosition: photo.objectPosition,
          objectFit: full && photo.id === '14' ? 'contain' : undefined,
        }}
        onLoad={() => setLoaded(true)}
      />
    </span>
  );
}
