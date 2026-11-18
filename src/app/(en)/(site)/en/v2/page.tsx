import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { pagePaths } from "@/lib/routes";
import { home } from "@/content/home";
import { HomeView } from "@/views/HomeView";

// The homepage without 3D: the same page with a 2D hero. Canonical stays the homepage; never indexed.
export const metadata: Metadata = {
  ...buildMetadata({
    locale: "en",
    title: home.meta.title.en,
    description: home.meta.description.en,
    alternates: pagePaths.home,
    absoluteTitle: true,
  }),
  robots: { index: false, follow: true },
};

export default function Page() {
  return <HomeView locale="en" hero="2d" />;
}
