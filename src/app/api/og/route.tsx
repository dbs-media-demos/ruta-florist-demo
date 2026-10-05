import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";

// Brand fonts, read once. URLs relative to this file are traced into the deployment.
const [gloock, albert, caveat] = await Promise.all([
  readFile(new URL("../../../assets/fonts/Gloock.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/AlbertSans.ttf", import.meta.url)),
  readFile(new URL("../../../assets/fonts/Caveat.ttf", import.meta.url)),
]);

const PETAL = "M16 12 C 12.6 9.4, 12.4 4.2, 16 2.2 C 19.6 4.2, 19.4 9.4, 16 12 Z";

/** Branded 1200×630 share image: /api/og?title=…&eyebrow=…&locale=sr|en&img=/images/… */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Ruta · cvetni atelje").slice(0, 100);
  const eyebrow = (searchParams.get("eyebrow") ?? "Dorćol, Beograd").slice(0, 40);
  const sr = searchParams.get("locale") !== "en";
  const img = searchParams.get("img") ?? "/images/products/white-morning-1.jpg";
  let photo: ArrayBuffer | null = null;
  if (/^\/images\/[\w\-/]+\.jpg$/.test(img)) {
    try {
      const res = await fetch(new URL(img, origin));
      if (res.ok) photo = await res.arrayBuffer();
    } catch {}
  }
  const size = title.length > 60 ? 54 : title.length > 34 ? 66 : 84;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#f6f2ea", fontFamily: "Albert" }}>
        <div style={{ width: photo ? 720 : 1200, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, color: "#17271f" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <svg width="40" height="50" viewBox="0 0 32 40">
              <path d={PETAL} fill="#17271f" />
              <path d={PETAL} fill="#17271f" transform="rotate(90 16 12)" />
              <path d={PETAL} fill="#17271f" transform="rotate(180 16 12)" />
              <path d={PETAL} fill="#17271f" transform="rotate(270 16 12)" />
              <circle cx="16" cy="12" r="2" fill="#e0533a" />
              <circle cx="23.4" cy="37.8" r="1.9" fill="#e0533a" />
            </svg>
            <div style={{ display: "flex", fontFamily: "Gloock", fontSize: 46, letterSpacing: -1 }}>Ruta</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", fontSize: 20, letterSpacing: 4, color: "#b23a22", textTransform: "uppercase" }}>{eyebrow}</div>
            <div style={{ display: "flex", fontFamily: "Gloock", fontSize: size, lineHeight: 1.0, letterSpacing: -1.5 }}>{title}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 40, color: "#b23a22" }}>{sr ? "Cveće koje stiže danas." : "Flowers, on their way today."}</div>
            <div style={{ display: "flex", fontSize: 18, color: "#56625a" }}>{sr ? "Poruči do 14:00" : "Order by 14:00"}</div>
          </div>
        </div>
        {photo && (
          <div style={{ width: 480, height: "100%", display: "flex", padding: 28, paddingLeft: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={photo as unknown as string} width={452} height={574} style={{ objectFit: "cover", width: 452, height: 574, borderRadius: 32 }} />
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Gloock", data: gloock, weight: 400, style: "normal" },
        { name: "Albert", data: albert, weight: 500, style: "normal" },
        { name: "Caveat", data: caveat, weight: 500, style: "normal" },
      ],
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=31536000, immutable" },
    },
  );
}
