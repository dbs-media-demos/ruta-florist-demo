import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { pagePaths } from "@/lib/routes";
import { home } from "@/content/home";
import { HomeView } from "@/views/HomeView";

export const metadata: Metadata = buildMetadata({
  locale: "en",
  title: home.meta.title.en,
  description: home.meta.description.en,
  alternates: pagePaths.home,
  absoluteTitle: true,
});

export default function Page() {
  return <HomeView locale="en" />;
}
