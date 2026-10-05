"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { ui, useUI } from "@/lib/commerce/store";
import { Dialog, CloseButton } from "@/components/ui/Dialog";
import { BuyBox } from "./BuyBox";

/** Quick view sheet: photo, variant pick, delivery slot and add to bag without leaving the grid. */
export function QuickView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const { quick: p } = useUI();
  return (
    <Dialog open={!!p} onClose={ui.closeQuick} label={p ? `${d.product.quickView}: ${p.name[locale]}` : d.product.quickView} variant="modal">
      {p && <QuickBody key={p.id} p={p} locale={locale} />}
    </Dialog>
  );
}

function QuickBody({ p, locale }: { p: ProductLite; locale: Locale }) {
  const d = getDictionary(locale);
  const [img, setImg] = useState(0);
  const photo = useRef<HTMLDivElement>(null);
  return (
        <div className="grid max-h-[92vh] overflow-y-auto md:max-h-[88vh] md:grid-cols-[1fr_1.1fr]">
          <div ref={photo} className="frame relative aspect-[4/5] md:aspect-auto md:min-h-full">
            {p.images.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={i === 0 ? p.alt[locale] : ""}
                fill
                sizes="(min-width: 768px) 30rem, 100vw"
                className="object-cover transition-opacity duration-700"
                style={{ opacity: i === img ? 1 : 0 }}
              />
            ))}
            {p.images.length > 1 && (
              <div className="absolute bottom-4 left-4 flex gap-1.5">
                {p.images.map((src, i) => (
                  <button key={src} type="button" onClick={() => setImg(i)} aria-label={d.product.photo(i + 1, p.images.length)} aria-pressed={img === i} className="grid h-8 w-8 place-items-center">
                    <span className={`block h-2 w-2 rounded-full ${img === i ? "bg-paper" : "bg-paper/50"}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative p-6 md:p-9">
            <CloseButton onClick={ui.closeQuick} label={d.product.close} className="absolute right-4 top-4 bg-paper" />
            <p className="t-eyebrow text-muted">{d.product.quickView}</p>
            <h2 className="t-h2 mt-3 pr-12">{p.name[locale]}</h2>
            <p className="mt-3 text-muted">{p.short[locale]}</p>
            <div className="mt-6">
              <BuyBox product={p} locale={locale} compact getSource={() => photo.current} onPalette={(i) => setImg(Math.min(i, p.images.length - 1))} />
            </div>
            <Link href={`${locale === "sr" ? "/proizvod" : "/en/product"}/${p.slug[locale]}`} onClick={ui.closeQuick} className="link-u mt-6 inline-block text-sm font-semibold">
              {d.product.viewFull} →
            </Link>
          </div>
        </div>
  );
}
