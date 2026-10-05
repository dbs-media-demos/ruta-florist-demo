import { metaFor } from "@/content/meta";
import { WeddingsView } from "@/views/InfoViews";

export const metadata = metaFor("en", "weddings");

export default function Page() {
  return <WeddingsView locale="en" />;
}
