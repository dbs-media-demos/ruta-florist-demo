import { metaFor } from "@/content/meta";
import { AboutView } from "@/views/InfoViews";

export const metadata = metaFor("en", "about");

export default function Page() {
  return <AboutView locale="en" />;
}
