# Design

Personal site for Carlos Lezama. The layout follows the quiet single column of noechague.com: a 16px
name and role, a short bio, a contribution year, a tilted photo fan, and Bingo in the profile
picture slot. There is no components section.

The location is Mexico City (`app/page.tsx`, `components/shell.tsx`).

## Type

The `geist` package supplies the faces. Body copy and headings are Geist Sans: 16px body at
`#646464`, 16px medium headings and the name, and 14px footer.

The footer clock uses Geist Mono with tabular digits (`package.json`, `app/globals.css`,
`components/clock.tsx`).

The clock is 24-hour and ticks on second boundaries while the tab is visible. It reads `18:34:00 in
Mexico City`. Static HTML shows `--:--:-- in Mexico City`; a `<time>` element resyncs on visibility
change without aria-live announcements (`components/clock.tsx`).

## Color

Light and dark tokens live in `app/globals.css`. Text and muted text both clear WCAG AA on the page
background. `auto` follows the system.

The theme switch is a 16px state-specific icon at every width with a 44×44 hit area. The choice is
stored in `localStorage` under `theme`. An inline script in `head` sets `data-theme` before paint
(`components/theme-toggle.tsx`, `app/layout.tsx`).

## Bingo

Bingo is Carlos's border collie and replaces the profile picture. The supplied `public/bingo.png`
and `public/bingo-dark.png` are 128×64 sheets: four 32×32 frames per row. The top row is a
continuous wag/pant loop (0.9s).

Hover, tap, or keyboard focus plays the bottom run-toward-you row once (0.6s), then restores the wag
loop (`components/bingo.tsx`, `app/globals.css`).

The largest visible frame measures 18×27 source pixels. Both the interactive element and its image
box are explicitly 54×81px at exact 3× scale, with `flex-shrink: 0`, zero margin, and hidden
overflow. Every visible pixel stays inside this box.

Header layout uses `align-items: center`, a 16px gap and a 32px bottom margin at every width, so the
visible paws remain at least 32px from the following paragraph. The background sheet renders at
384×192px (`app/globals.css`).

Per-frame background offsets remove transparent padding and center shorter frames inside the 54×81
box without cropping the artwork or positioning elements outside their boxes.

The sprite uses `image-rendering: pixelated`, `role="img"` and the accessible name "Bingo, Carlos's
border collie". Its interactive button is keyboard focusable.

Reduced motion shows static frame 0 of the top row, even during interaction (`components/bingo.tsx`,
`app/globals.css`).

## Column

The reading column is capped at 43.25rem (692px). Pages keep that cap from a phone up through 2560px
(`app/globals.css`).

## Elsewhere

`lib/elsewhere.json` contains the 17 real photos in supplied order. The reference has a seven-card
fan; ours wraps into 7/7/3 fans to retain its card size, arc and rotation without overflowing or
compressing 17 cards into one unreadable strip.

The final row is centered (`components/photo-fan.tsx`, `app/globals.css`).

Sanitized sources and generated WebPs are gitignored. Bun.Image prepares static variants without
upscaling or pixel cropping; the wrapper is 4:5 and owns the dominant-color placeholder
(`.gitignore`, `scripts/build-photos.ts`, `components/photo-fan.tsx`).

Each image fills the wrapper with `object-fit: cover` and manifest `object-position`. Paris, 13 and
14 are centered. Moving day (15) is 80% 50% to preserve the three people (the date can be cut).

ITAM grad (17) is 45% 50%; other frames are centered (`lib/elsewhere.json`).

Captions use Geist Mono 12px muted text and appear on hover, focus, and in the tap-opened dialog. A
150ms opacity-only fade follows loading, with no motion for reduced-motion users
(`components/photo-fan.tsx`, `app/globals.css`).

## Not found

The exported `404.html` keeps the home-page shell and footer. Its 404 numeral uses Geist Serif,
followed by “Nothing lives here.” and a Back home link. The 404 has no profile slot or animal
(`app/not-found.tsx`, `app/globals.css`).

The Worker uses `assets.not_found_handling: "404-page"`; there is no custom 500 page
(`wrangler.jsonc`).

## Footer links

The social glyphs are X, Instagram, LinkedIn, then the theme toggle. All are 16px with separate
44×44 hit areas, muted text color, and the link color on hover or keyboard focus
(`components/footer-social-links.tsx`, `components/theme-toggle.tsx`, `app/globals.css`).

Below 640px they occupy a left-aligned row above the time and Markdown link; from tablet up the
footer stays on one line. Contributions flows directly into Elsewhere (`components/shell.tsx`,
`app/globals.css`).

## Photo viewer cleanup

The viewer uses the Base UI Dialog primitive from `@base-ui/react/dialog` for portal, outside press,
Escape, focus return, inertness and scroll locking.

The local wrapper is styled for the photo lightbox (`components/ui/dialog.tsx`,
`components/photo-fan.tsx`, `package.json`).

Grid buttons never receive an open state or imperative transforms; a separate Motion layoutId figure
grows from and returns to the source image. Closing waits for Motion exit completion, then unmounts
the Base UI dialog (`components/photo-fan.tsx`).

Reduced motion uses a plain fade. The dialog includes sr-only close and previous/next controls. Back
history and swipe down request the same dialog close action (`components/photo-fan.tsx`).

## Photo shuffle

Server markup retains manifest order. A tiny inline script immediately before the fan runs
Fisher–Yates once per page load and injects per-photo CSS positions before those cards are parsed
and painted.

It stores the permutation on `window` (`components/photo-fan.tsx`, `lib/elsewhere-shuffle.ts`).

After hydration, a `useEffect` adopts that same permutation as React DOM order; a layout effect in
that commit removes the temporary positioning style before paint, preserving screen positions.
Native Tab order then matches visual order.

Captions and selection stay attached to photo IDs; arrow keys and sr-only next/previous controls
step through the same sequence. No positive `tabindex` is used. All images remain lazy and no fixed
image is preloaded.

With JavaScript disabled the default manifest order is unchanged (`components/photo-fan.tsx`,
`lib/elsewhere-shuffle.ts`).
