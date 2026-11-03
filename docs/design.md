# Design

Personal site for Carlos Lezama. The layout follows the quiet single column of noechague.com: a 16px name and role, a short bio, a contribution year, a tilted photo fan, and Bingo in the footer. There is no components section. The location is Mexico City.

## Type

The `geist` package supplies the faces. Body copy and headings are Geist Sans: 16px body at `#646464`, 16px medium headings and the name, 14px footer. The footer clock uses Geist Mono with tabular digits. It is 24-hour, updates once a minute, and reads `18:34 in Mexico City`.

## Color

Light and dark tokens live in `app/globals.css`. Text and muted text both clear WCAG AA on the page background. `auto` follows the system. The theme switch is a 16px state-specific icon at every width with a 44×44 hit area. The choice is stored in `localStorage` under `theme`. An inline script in `head` sets `data-theme` before paint.

## Bingo

Bingo is a red merle border collie. The supplied `public/dog.png` and `public/dog-dark.png` are 128×64 pixel sheets with four columns and two rows of 32×32 frames. The top row idles with a continuous wag/pant loop (0.9s); the bottom row runs (0.6s) while hovered or focused, including after a tap. The 404 autoplays the run cycle.

Rendering keeps exact 2× scaling: a 256×128 background, 64×64 frame, -64px run-row offset and -256px loop offset. The transparent frame stays in the existing 40×24 footer anchor at the same position with `image-rendering: pixelated`. The sprite is `aria-hidden`; its focusable button is named Play with Bingo. The dark sheet follows the theme. Reduced motion holds frame 0 of the current row with no animation.

## Column

The reading column is capped at 43.25rem (692px). Pages keep that cap from a phone up through 2560px.

## Elsewhere

Photos in `content/photos.json` render as a tilted overlapping fan. Hover lifts one card. A click opens that photo alone. There are seven cards, with no autoplay or previous/next control. The selected card animates from its fan position to the dialog and back on close; reduced motion skips this transition.

## Not found

The exported `404.html` keeps the home-page shell and footer. Its 404 numeral uses Geist Serif, followed by “Nothing lives here.” and a Back home link. Bingo autoplays the run cycle on this page. Reduced motion holds the first run frame. The Worker uses `assets.not_found_handling: "404-page"`; there is no custom 500 page.

## Footer links

The social glyphs are X, Instagram, LinkedIn, then the theme toggle. All are 16px with separate 44×44 hit areas, muted text color, and the link color on hover or keyboard focus. Below 640px they occupy a left-aligned row above the time and Markdown link; from tablet up the footer stays on one line. Contributions flows directly into Elsewhere.
