import { zoneById } from "@/content/zones";
import { delivery } from "@/lib/site";
import type { CheckoutProvider } from "./provider";
import type { OrderSummary } from "./types";

/** The one promo code that works in the demo (documented in DEMO.md). */
export const DEMO_PROMO = { code: "DOBRODOSLI10", alias: "WELCOME10", percent: 10 };

export const VASE_PRICE = 2400;

/**
 * Demo checkout. In production `placeOrder` would create the order server-side and hand the
 * payment to a local bank gateway (card / DinaCard), generate a real IPS QR, or mark it COD.
 * Card fields never reach this function: the payment form keeps them inside its component.
 */
export const checkout: CheckoutProvider = {
  validatePromo(code) {
    const c = code.trim().toUpperCase();
    if (c === DEMO_PROMO.code || c === DEMO_PROMO.alias) return { ok: true, code: c, percent: DEMO_PROMO.percent };
    return { ok: false };
  },

  quoteShipping(zoneId, subtotal) {
    const zone = zoneId ? zoneById(zoneId) : undefined;
    const base = zone ? zone.price : 350;
    const central = zone ? zone.central : true;
    const free = central && subtotal >= delivery.freeOver;
    return { zoneId: zoneId ?? "", price: free ? 0 : base, free: free || base === 0, missing: central ? Math.max(0, delivery.freeOver - subtotal) : 0 };
  },

  totals(lines, promo, zoneId) {
    const subtotal = lines.reduce((s, l) => s + l.unit * l.qty, 0);
    const pr = promo ? checkout.validatePromo(promo) : { ok: false };
    const discount = pr.ok && pr.percent ? Math.round((subtotal * pr.percent) / 100) : 0;
    const shipping = checkout.quoteShipping(zoneId, subtotal - discount);
    const total = subtotal - discount + shipping.price;
    // Prices include 20% PDV.
    return { subtotal, discount, shipping, total, vat: Math.round(total - total / 1.2) };
  },

  async placeOrder({ draft, lines, promo }) {
    await new Promise((r) => setTimeout(r, 1500));
    const t = checkout.totals(lines, promo, draft.recipient.zone);
    const order: OrderSummary = {
      number: `RT-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      email: draft.email,
      lines: lines.map((l) => ({ name: l.name, variant: l.variantLabel, qty: l.qty, price: l.unit, image: l.image })),
      subtotal: t.subtotal,
      discount: t.discount,
      shipping: t.shipping.price,
      total: t.total,
      delivery: draft.delivery,
      zoneName: zoneById(draft.recipient.zone)?.name ?? "",
      recipientName: draft.recipient.name,
      payment: draft.payment,
      surprise: draft.surprise,
      card: draft.card,
    };
    return order;
  },

  async trackOrder(number, email) {
    await new Promise((r) => setTimeout(r, 900));
    if (!/^RT-?\d{4,}$/i.test(number.trim()) || !/.+@.+\..+/.test(email)) return null;
    const now = Date.now();
    const at = (mins: number) => new Date(now - mins * 60000).toISOString();
    return [
      { id: "placed", at: at(150), done: true },
      { id: "arranged", at: at(95), done: true },
      { id: "courier", at: at(25), done: true },
      { id: "delivered", done: false },
    ];
  },
};
