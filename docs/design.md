# Design

Personal site for Carlos Lezama. The layout follows the quiet single column of noechague.com: a fixed note at the top, name, short bio, contribution year, lists, a photo carousel, and a footer cat. There is no components section. The location is Mexico City.

## Type

The `geist` package (1.9.0) supplies the faces.

- Geist Sans at 400 for body text and 500 for UI (buttons, row titles, badges, links).
- Geist Serif Regular for display only: the name, section titles, article titles, and blockquotes.
- Geist Mono for data, including the line `Mexico City · 19.43°N 99.13°W · 17:36 CST`. The clock is rendered on the server first, then updated in place so the line does not shift.

Sizes use `clamp`. At 1920px and wider, every step moves up one size.

The package exposes Geist Serif Square as its own family (`GeistSerifSquare`, `--font-geist-serif-square`), not as an ELSH axis on the variable font. Hovering the name swaps to that Square cut. Triangle and Heart cuts are not used.

## Color

Light and dark tokens live in `app/globals.css`. Text and muted text both clear WCAG AA on the page background. `auto` follows the system. The choice is stored in `localStorage` under `theme`. An inline script in `head` sets `data-theme` before paint.

## Cat

`public/cat.png` is the light sheet and `public/cat-dark.png` is the same sheet with a light outline. Both are 128×64, four columns by two rows of 32×32 frames. Row 0 is awake (about 0.9s per loop). Row 1 is asleep (about 1.8s). The element is 64×64, `background-size: 256px 128px`, `image-rendering: pixelated`, and a `steps(4)` animation on `background-position-x`. The sheet swaps with `data-theme`. No artwork is copied from the reference site.

The cat sleeps from 23:00 through 07:59 in `America/Mexico_City`. The build stamps a default `data-cat` value, and a small script corrects it in the browser, then again every minute, so a tab left open switches at the boundary. While asleep, three Geist Mono `z` marks use the theme text color, staggered by `--rang` at 1.05s, on a 3.2s fade that drifts up and to the right.

`prefers-reduced-motion: reduce` holds the first frame of the current row. The `z` marks stay visible and still while the cat is asleep. The cat is `aria-hidden`.

## Column

The reading column is capped at 42.5rem (680px). Pages keep that cap from a phone up through 2560px.
