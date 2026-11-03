'use client';

import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { Slide } from '../lib/content';

export function Carousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const regionRef = useRef<HTMLElement>(null);
  const startX = useRef<number | null>(null);
  const count = slides.length;

  function go(next: number) {
    setIndex((next + count) % count);
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAutoplay(!media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const root = regionRef.current;
    if (!root) return;
    let paused = false;
    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', resume);
    const id = window.setInterval(() => {
      if (!paused && document.visibilityState === 'visible') {
        setIndex((current) => (current + 1) % count);
      }
    }, 5000);
    return () => {
      window.clearInterval(id);
      root.removeEventListener('mouseenter', pause);
      root.removeEventListener('mouseleave', resume);
      root.removeEventListener('focusin', pause);
      root.removeEventListener('focusout', resume);
    };
  }, [autoplay, count]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(index - 1);
    }
  }

  return (
    <section
      ref={regionRef}
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Photos"
      tabIndex={0}
      data-autoplay={autoplay ? 'on' : 'off'}
      onKeyDown={onKeyDown}
    >
      <p className="visually-hidden">Use the arrow keys to change photos.</p>
      <div
        className="carousel-frame"
        onPointerDown={(event) => {
          startX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          startX.current = null;
          if (delta <= -40) go(index + 1);
          else if (delta >= 40) go(index - 1);
        }}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        {slides.map((slide, slideIndex) => (
          <figure
            key={slide.src}
            className="carousel-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${count}`}
            aria-hidden={slideIndex === index ? 'false' : 'true'}
            hidden={slideIndex !== index}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              width={slide.width}
              height={slide.height}
              loading={slideIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <figcaption>{slide.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="carousel-controls">
        <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo">
          Previous
        </button>
        <p className="carousel-count" aria-live="polite">
          {index + 1} / {count}
        </p>
        <button type="button" onClick={() => go(index + 1)} aria-label="Next photo">
          Next
        </button>
      </div>
    </section>
  );
}
