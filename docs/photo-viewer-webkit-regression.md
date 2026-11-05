# WebKit close failure

A 393×852 touch WebKit reproduction showed that opacity transitionend arrived with `pseudoElement: ""`, while the old completion handler required `"::backdrop"`. Close animation completed visually but finalization never ran.

After the failed close:

- HTML retained `overflow: hidden !important`; body had no new inline properties.
- The native dialog retained `open`, `data-closing="true"`, the `photo-dialog` class, and its full-screen top-layer hit target. `elementFromPoint(196,426)` returned DIALOG.
- The original tile retained `aria-expanded="true"`, making it hidden through CSS. Its inline fan position/variables had not changed; no inline fixed position or transform was added to that button.
- The separate `photo-frame` clone retained its return-animation transform inside the fixed dialog, making it look like the tile was pinned to the screen.
- Native modal inertness remained active (no explicit inert/aria-hidden attribute was added by our component). Cancel, close, click, transitionend, keydown, pointerdown, pointerup, pointercancel, and popstate handlers remained registered because unmount was never reached.

The replacement uses the shadcn Base UI Dialog primitive for portal removal, modal scroll lock, dismissal and focus return. Motion owns the shared-layout figure animation; grid buttons have no open state or imperative style changes. There is no native dialog, backdrop-transition completion filter, body/html style mutation or manual scroll restoration in the photo component.
