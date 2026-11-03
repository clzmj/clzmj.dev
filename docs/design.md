# Design

Personal site for Carlos Lezama. The layout follows the quiet single column of noechague.com: a 16px name and role, a short bio, a contribution year, a tilted photo fan, and Bingo in the profile picture slot. There is no components section. The location is Mexico City.

## Type

The `geist` package supplies the faces. Body copy and headings are Geist Sans: 16px body at `#646464`, 16px medium headings and the name, 14px footer. The footer clock uses Geist Mono with tabular digits. It is 24-hour, updates once a minute, and reads `18:34 in Mexico City`.

## Color

Light and dark tokens live in `app/globals.css`. Text and muted text both clear WCAG AA on the page background. `auto` follows the system. The theme switch is a 16px state-specific icon at every width with a 44×44 hit area. The choice is stored in `localStorage` under `theme`. An inline script in `head` sets `data-theme` before paint.

## Bingo

Bingo is Carlos's border collie and replaces the profile picture. The supplied `public/bingo.png` and `public/bingo-dark.png` are 128×64 sheets: four 32×32 frames per row. The top row is a continuous wag/pant loop (0.9s). Hover, tap, or keyboard focus plays the bottom run-toward-you row once (0.6s), then restores the wag loop.

The existing 44×44 slot and profile text positions stay fixed, with a 16px horizontal gap and a 32px header bottom margin at every width. The 96×96 sprite frame keeps exact integer scale (3×), with a 384×192 background, -96px run-row offset and -384px loop offset. Both sheets have the same alpha bounds. Idle frames have 6–8px left, 4–5px top, and 1px bottom padding; run frames have 7–8px left, 5–6px top, and 1–3px bottom padding. Per-frame integer offsets compensate for this padding: the visible left sits on the content edge, and the visible center stays within 0.5px of the two-line name block center. The sheets are preserved without cropping. The slot has no circular crop, border, or overflow clipping, so the ears remain visible. The sprite uses `image-rendering: pixelated`, `role="img"` and the accessible name "Bingo, Carlos's border collie". Its interactive button is keyboard focusable. Reduced motion shows static frame 0 of the top row, even during interaction.

## Column

The reading column is capped at 43.25rem (692px). Pages keep that cap from a phone up through 2560px.

## Elsewhere

Photos in `content/photos.json` render as a tilted overlapping fan. Hover lifts one card. A click opens that photo alone. There are seven cards, with no autoplay or previous/next control. The selected card animates from its fan position to the dialog and back on close; reduced motion skips this transition.

## Not found

The exported `404.html` keeps the home-page shell and footer. Its 404 numeral uses Geist Serif, followed by “Nothing lives here.” and a Back home link. The 404 has no profile slot or animal. The Worker uses `assets.not_found_handling: "404-page"`; there is no custom 500 page.

## Footer links

The social glyphs are X, Instagram, LinkedIn, then the theme toggle. All are 16px with separate 44×44 hit areas, muted text color, and the link color on hover or keyboard focus. Below 640px they occupy a left-aligned row above the time and Markdown link; from tablet up the footer stays on one line. Contributions flows directly into Elsewhere.
