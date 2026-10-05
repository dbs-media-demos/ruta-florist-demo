import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ruta · cvetni atelje",
    short_name: "Ruta",
    description: "Cveće koje stiže danas. Cvetni atelje na Dorćolu, Beograd.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2ea",
    theme_color: "#17271f",
    lang: "sr-Latn",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
