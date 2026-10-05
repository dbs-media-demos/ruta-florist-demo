import { metaFor } from "@/content/meta";
import { BusinessView } from "@/views/InfoViews";

export const metadata = metaFor("en", "business");

export default function Page() {
  return <BusinessView locale="en" />;
}
