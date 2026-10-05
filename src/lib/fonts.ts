import { Albert_Sans, Caveat, Gloock } from "next/font/google";

/**
 * Display: Gloock, a high-contrast serif with soft, ball-ended strokes (botanical, editorial).
 * Text: Albert Sans. Handwriting for card messages: Caveat (not preloaded; it only appears
 * further down the page and in the card editor). `subsets` only controls preloading here;
 * the latin-ext faces for č ć š ž đ still load via unicode-range.
 */
export const gloock = Gloock({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-gloock",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

export const albert = Albert_Sans({
  subsets: ["latin"],
  variable: "--font-albert",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
  fallback: ["cursive"],
});

export const fontVariables = `${gloock.variable} ${albert.variable} ${caveat.variable}`;
