"use client";

import { useSyncExternalStore } from "react";
import type { Localized } from "@/lib/i18n";
import type { CardMessage, CartLine, DeliveryChoice, ProductLite } from "./types";

/**
 * Tiny external stores (bag, wishlist, recently viewed, UI) read with useSyncExternalStore.
 * Persisted in localStorage; every read/write is wrapped so the shop still works without storage.
 */
function createStore<T>(key: string | null, initial: T) {
  let state = initial;
  let hydrated = false;
  const listeners = new Set<() => void>();

  const load = () => {
    if (hydrated || !key || typeof window === "undefined") return;
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) state = { ...initial, ...JSON.parse(raw) };
    } catch {}
  };

  const emit = () => listeners.forEach((l) => l());

  return {
    get: () => {
      load();
      return state;
    },
    set: (next: T | ((prev: T) => T)) => {
      load();
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      if (key) {
        try {
          window.localStorage.setItem(key, JSON.stringify(state));
        } catch {}
      }
      emit();
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      // keep tabs in sync (and the other language's pages)
      const onStorage = (e: StorageEvent) => {
        if (key && e.key === key) {
          hydrated = false;
          load();
          emit();
        }
      };
      if (key) window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(l);
        if (key) window.removeEventListener("storage", onStorage);
      };
    },
    initial,
  };
}

// ——— Bag ———

export interface BagState {
  lines: CartLine[];
  delivery?: DeliveryChoice;
  promo?: string;
  card?: CardMessage;
}

const bagStore = createStore<{ v: 1 } & BagState>("ruta-bag", { v: 1, lines: [] });

export const useBag = () => useSyncExternalStore(bagStore.subscribe, bagStore.get, () => bagStore.initial);
export const getBag = () => bagStore.get();

export const bagCount = (s: BagState) => s.lines.reduce((n, l) => n + l.qty, 0);

export function addLine(line: Omit<CartLine, "key">) {
  const key = [line.productId, line.variantId, line.palette ?? "", line.vase ? "v" : "", line.recipe ? Date.now() : ""].join(":");
  bagStore.set((s) => {
    const existing = s.lines.find((l) => l.key === key);
    const lines = existing
      ? s.lines.map((l) => (l.key === key ? { ...l, qty: Math.min(l.maxQty, l.qty + line.qty) } : l))
      : [...s.lines, { ...line, key }];
    return { ...s, lines };
  });
}

export const setQty = (key: string, qty: number) =>
  bagStore.set((s) => ({ ...s, lines: s.lines.map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(l.maxQty, qty)) } : l)) }));

export function removeLine(key: string) {
  const s = bagStore.get();
  const index = s.lines.findIndex((l) => l.key === key);
  const line = s.lines[index];
  bagStore.set({ ...s, lines: s.lines.filter((l) => l.key !== key) });
  return line ? { line, index } : null;
}

export const restoreLine = (removed: { line: CartLine; index: number }) =>
  bagStore.set((s) => {
    const lines = [...s.lines];
    lines.splice(Math.min(removed.index, lines.length), 0, removed.line);
    return { ...s, lines };
  });

export const setDelivery = (delivery: DeliveryChoice | undefined) => bagStore.set((s) => ({ ...s, delivery }));
export const setPromo = (promo: string | undefined) => bagStore.set((s) => ({ ...s, promo }));
export const setCard = (card: CardMessage | undefined) => bagStore.set((s) => ({ ...s, card }));
export const clearBag = () => bagStore.set({ v: 1, lines: [] });

// ——— Wishlist & recently viewed (snapshots so the pages render without the catalogue) ———

export interface ProductSnap {
  id: string;
  slug: Localized<string>;
  name: Localized<string>;
  image: string;
  image2?: string;
  price: number;
  compareAt?: number;
}

export const snapOf = (p: ProductLite): ProductSnap => {
  const v = p.variants.find((x) => x.id === "m") ?? p.variants[0];
  return { id: p.id, slug: p.slug, name: p.name, image: p.images[0], image2: p.images[1], price: Math.min(...p.variants.map((x) => x.price)), compareAt: v.compareAt };
};

const wishStore = createStore<{ items: ProductSnap[] }>("ruta-wish", { items: [] });
export const useWishlist = () => useSyncExternalStore(wishStore.subscribe, wishStore.get, () => wishStore.initial);
export const isWished = (id: string) => wishStore.get().items.some((i) => i.id === id);
export function toggleWish(snap: ProductSnap) {
  const has = isWished(snap.id);
  wishStore.set((s) => ({ items: has ? s.items.filter((i) => i.id !== snap.id) : [snap, ...s.items] }));
  return !has;
}

const recentStore = createStore<{ items: ProductSnap[] }>("ruta-recent", { items: [] });
export const useRecent = () => useSyncExternalStore(recentStore.subscribe, recentStore.get, () => recentStore.initial);
export const pushRecent = (snap: ProductSnap) => recentStore.set((s) => ({ items: [snap, ...s.items.filter((i) => i.id !== snap.id)].slice(0, 8) }));

// ——— UI (not persisted) ———

export interface UIState {
  drawer: boolean;
  search: boolean;
  quick: ProductLite | null;
  announce: string;
  bump: number;
}

const uiStore = createStore<UIState>(null, { drawer: false, search: false, quick: null, announce: "", bump: 0 });
export const useUI = () => useSyncExternalStore(uiStore.subscribe, uiStore.get, () => uiStore.initial);
export const ui = {
  openDrawer: () => uiStore.set((s) => ({ ...s, drawer: true, quick: null })),
  closeDrawer: () => uiStore.set((s) => ({ ...s, drawer: false })),
  openSearch: () => uiStore.set((s) => ({ ...s, search: true })),
  closeSearch: () => uiStore.set((s) => ({ ...s, search: false })),
  openQuick: (p: ProductLite) => uiStore.set((s) => ({ ...s, quick: p })),
  closeQuick: () => uiStore.set((s) => ({ ...s, quick: null })),
  announce: (msg: string) => uiStore.set((s) => ({ ...s, announce: msg })),
  bump: () => uiStore.set((s) => ({ ...s, bump: s.bump + 1 })),
};
