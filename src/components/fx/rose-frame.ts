/**
 * Framing shared by the live rose (RoseScene, desktop only) and the server-rendered stills.
 * No three.js here, so the hero can read it without pulling the 3D bundle.
 */
/** Where the rose sits on a desktop hero at rest, as fractions of its width and height. */
export const ROSE_REST = { cx: 0.665, cy: 0.5 };
/** How open the bloom is in the desktop still, and where the live rose starts, so the cross-fade is seamless. */
export const ROSE_STILL_OPEN = 0.3;
