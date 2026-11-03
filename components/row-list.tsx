'use client';

import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

export function RowList({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const layoutId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  useEffect(() => {
    const node = listRef.current;
    if (!node) return;
    const onOver = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const slot = (event.target as HTMLElement | null)?.closest?.('[data-row]');
      if (!(slot instanceof HTMLElement) || !node.contains(slot)) {
        setActive(null);
        return;
      }
      const index = Number(slot.dataset.row);
      setActive(Number.isNaN(index) ? null : index);
    };
    const onLeave = () => setActive(null);
    node.addEventListener('pointerover', onOver);
    node.addEventListener('pointerleave', onLeave);
    return () => {
      node.removeEventListener('pointerover', onOver);
      node.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  const transition = reduced
    ? { duration: 0 }
    : {
        layout: { type: 'spring' as const, duration: 0.4, bounce: 0.18 },
        opacity: { duration: 0.18 },
      };
  return (
    <div className="stack" ref={listRef}>
      {items.map((child, index) => (
        <div
          key={isValidElement(child) && child.key != null ? String(child.key) : partFallback(child)}
          className="row-slot"
          data-row={index}
        >
          <AnimatePresence initial={false}>
            {active === index ? (
              <motion.span
                layoutId={layoutId}
                className="row-highlight"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
              />
            ) : null}
          </AnimatePresence>
          <div className="row-slot-content">{child}</div>
        </div>
      ))}
    </div>
  );
}

function partFallback(child: ReactNode): string {
  return typeof child === 'string' || typeof child === 'number' ? String(child) : 'row';
}
