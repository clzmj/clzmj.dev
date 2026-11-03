1. The live noechague fan leaves each grid button in its absolute fan slot and opens a separate photo figure inside a Base UI Dialog portal/popup.
2. It saves the clicked button as the focus target and measures its rest geometry; Motion animates only the separate figure toward/from that geometry, including the card tilt.
3. Base UI owns modal focus, inertness and scroll locking; observed body overflow is hidden while open and cleared again after the portal closes.
4. onOpenChange(false) calls preventUnmountOnClose, fades the backdrop and returns the figure; animation completion schedules actionsRef.unmount() on the next frame.
5. Portal removal clears the selected photo, restores the original tile opacity and returns focus through finalFocus; reduced motion uses zero-duration transitions.
