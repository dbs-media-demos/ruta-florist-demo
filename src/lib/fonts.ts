import { Caveat } from "next/font/google";
import localFont from "next/font/local";

/**
 * Display: Gloock, a high-contrast serif with soft, ball-ended strokes (botanical, editorial).
 * Text: Albert Sans (variable, 100–900). Both are OFL fonts from Google Fonts, subset to the
 * characters this site uses (Latin, č ć š ž đ, quotes, dashes, €, arrows), one woff2 file each,
 * so a phone downloads two font files (≈47 KB) instead of four.
 * Handwriting for card messages: Caveat (not preloaded; only further down the page, the card
 * editor and the desktop hero note).
 */
export const gloock = localFont({
  src: "../assets/fonts/Gloock-subset.woff2",
  weight: "400",
  variable: "--font-gloock",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
});

export const albert = localFont({
  src: "../assets/fonts/AlbertSans-subset.woff2",
  weight: "100 900",
  variable: "--font-albert",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const caveat = Caveat({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
  fallback: ["cursive"],
});

export const fontVariables = `${gloock.variable} ${albert.variable} ${caveat.variable}`;
