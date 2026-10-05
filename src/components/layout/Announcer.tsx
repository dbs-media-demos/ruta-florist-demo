"use client";

import { useUI } from "@/lib/commerce/store";

/** One polite live region for bag and wishlist updates ("Added Belo jutro, Srednji, to your bag"). */
export function Announcer() {
  const { announce } = useUI();
  return (
    <p aria-live="polite" role="status" className="sr-only">
      {announce}
    </p>
  );
}
