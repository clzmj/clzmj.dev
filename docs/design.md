# Design

Personal site for Carlos Lezama. The layout follows the quiet single column of noechague.com: a floating note, a 16px name and role, a short bio, a contribution year, lists, a tilted photo fan, and a footer cat. There is no components section. The location is Mexico City.

## Type

The `geist` package supplies the faces. Body copy and headings are Geist Sans: 16px body at `#646464`, 16px medium headings and the name, 14px footer. Geist Serif is only the blockquote accent. Geist Mono is only for code. The footer clock is 12-hour, updates once a minute, and reads `6:34pm in Mexico City, Mexico`.

## Color

Light and dark tokens live in `app/globals.css`. Text and muted text both clear WCAG AA on the page background. `auto` follows the system. The choice is stored in `localStorage` under `theme`. An inline script in `head` sets `data-theme` before paint.

## Cat

`public/cat.png` is the light sheet and `public/cat-dark.png` is the same sheet with a light outline. Both are 128×64, four columns by two rows of 32×32 frames. Row 0 is awake (about 0.9s per loop). Row 1 is asleep (about 1.8s). The element is drawn at 32×32, one frame per cell, with `image-rendering: pixelated`. It sits inline after the footer clock. The sheet swaps with `data-theme`. No artwork is copied from the reference site.

The cat sleeps from 23:00 through 07:59 in `America/Mexico_City`. The build stamps a default `data-cat` value, and a small script corrects it in the browser, then again every minute, so a tab left open switches at the boundary. While asleep, three 11px semibold `z` marks use the theme text color, staggered by `--rang` at 1.05s, on a 3.2s fade that drifts up and to the right.

`prefers-reduced-motion: reduce` holds the first frame of the current row. The `z` marks stay visible and still while the cat is asleep. The cat is `aria-hidden`.

## Column

The reading column is capped at 43.25rem (692px). Pages keep that cap from a phone up through 2560px.

## Elsewhere

Photos in `content/carousel.json` render as a tilted overlapping fan. Hover lifts one card. A click opens that photo alone. There is no carousel, autoplay, or previous/next control.
