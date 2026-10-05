import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { fontVariables } from "@/lib/fonts";
import { Logo } from "@/components/brand/Logo";
import { getDictionary } from "@/i18n/dictionary";

export const metadata: Metadata = {
  title: "404 | Ruta",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  const sr = getDictionary("sr").notFound;
  const en = getDictionary("en").notFound;
  return (
    <html lang="sr-Latn" className={fontVariables}>
      <body className="theme-paper flex min-h-screen flex-col">
        <header className="wrap flex h-24 items-center">
          <Link href="/" aria-label="Ruta" className="text-[1.15rem]">
            <Logo />
          </Link>
        </header>
        <main className="wrap grid flex-1 items-center gap-12 pb-20 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="t-eyebrow text-poppy-ink">404</p>
            <h1 className="t-display mt-4">
              4<span className="text-poppy">✿</span>4
            </h1>
            <div className="mt-10 grid max-w-3xl gap-10 sm:grid-cols-2">
              <div>
                <p className="t-h3">{sr.title}</p>
                <p className="mt-3 text-muted">{sr.text}</p>
                <Link href="/" className="btn btn-primary mt-6">
                  {sr.home}
                </Link>
              </div>
              <div lang="en">
                <p className="t-h3">{en.title}</p>
                <p className="mt-3 text-muted">{en.text}</p>
                <Link href="/en" className="btn btn-ghost mt-6">
                  {en.home}
                </Link>
              </div>
            </div>
          </div>
          <div className="frame relative hidden aspect-[4/5] rounded-[2rem] md:block">
            <Image src="/images/studio/petals-cloth.jpg" alt="" fill sizes="40vw" className="object-cover" />
          </div>
        </main>
      </body>
    </html>
  );
}
