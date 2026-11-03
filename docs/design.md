# Design

Personal site for Carlos Lezama. The layout follows the quiet single column of noechague.com: a 16px name and role, a short bio, a contribution year, a tilted photo fan, and a footer cat. There is no components section. The location is Mexico City.

## Type

The `geist` package supplies the faces. Body copy and headings are Geist Sans: 16px body at `#646464`, 16px medium headings and the name, 14px footer. The footer clock uses Geist Mono with tabular digits. It is 24-hour, updates once a minute, and reads `18:34 in Mexico City`.

## Color

Light and dark tokens live in `app/globals.css`. Text and muted text both clear WCAG AA on the page background. `auto` follows the system. The theme switch is a 16px state-specific icon at every width with a 44×44 hit area. The choice is stored in `localStorage` under `theme`. An inline script in `head` sets `data-theme` before paint.

## Cat

`public/cat.png` is the light sheet and `public/cat-dark.png` is the same sheet with a light outline. Both are 128×64, four columns by two rows of 32×32 frames. Row 0 is awake (about 0.9s per loop). Row 1 is asleep (about 1.8s). The sheet is scaled by exactly 2× to 256×128, with 64×64 frames and matching 64px row / 256px loop offsets. The transparent frame is absolutely positioned in a 40×24 footer anchor, with `image-rendering: pixelated`. It sits inline after the footer clock. The sheet swaps with `data-theme`. No artwork is copied from the reference site.

The cat sleeps from 22:00 through 06:59 in `America/Mexico_City`. The build stamps a default `data-cat` value, and a small script corrects it in the browser, then again every minute, so a tab left open switches at the boundary. While asleep, three 11px semibold `z` marks use the theme text color, staggered by `--rang` at 1.05s, on a 3.2s fade that drifts up and to the right.

`prefers-reduced-motion: reduce` holds the first frame of the current row. The `z` marks stay visible and still while the cat is asleep. The cat is `aria-hidden`.

## Column

The reading column is capped at 43.25rem (692px). Pages keep that cap from a phone up through 2560px.

## Elsewhere

Photos in `content/photos.json` render as a tilted overlapping fan. Hover lifts one card. A click opens that photo alone. There are seven cards, with no autoplay or previous/next control. The selected card animates from its fan position to the dialog and back on close; reduced motion skips this transition.

## Not found

The exported `404.html` keeps the home-page shell and footer. Its 404 numeral uses Geist Serif, followed by “Nothing lives here.” and a Back home link. The footer cat stays awake on this page, including at night. Reduced motion holds its first awake frame. The Worker uses `assets.not_found_handling: "404-page"`; there is no custom 500 page.

## Footer links

The social glyphs are X, Instagram, LinkedIn, then the theme toggle. All are 16px with separate 44×44 hit areas, muted text color, and the link color on hover or keyboard focus. Below 640px they occupy a left-aligned row above the time and Markdown link; from tablet up the footer stays on one line. Contributions flows directly into Elsewhere.
