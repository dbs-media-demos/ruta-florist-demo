import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import { localeMeta, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { SmoothScroll } from "./SmoothScroll";
import { Cursor } from "./Cursor";

/** The <html> document shared by the Serbian and English root layouts. */
export function RootDocument({ locale, children }: { locale: Locale; children: ReactNode }) {
  const dict = getDictionary(locale);
  return (
    <html lang={localeMeta[locale].htmlLang} className={fontVariables} suppressHydrationWarning>
      <body className="theme-paper min-h-screen pb-[calc(4.6rem+env(safe-area-inset-bottom))] md:pb-0">
        <a href="#main" className="fixed left-4 top-4 z-[300] -translate-y-24 rounded-full bg-poppy-ink px-5 py-3 text-sm font-semibold text-white focus:translate-y-0">
          {dict.skip}
        </a>
        <SmoothScroll />
        {children}
        <Cursor />
      </body>
    </html>
  );
}
