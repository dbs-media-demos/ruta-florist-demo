import { metaFor } from "@/content/meta";
import { LegalView } from "@/views/InfoViews";

export const metadata = metaFor("en", "terms");

export default function Page() {
  return <LegalView locale="en" kind="terms" />;
}
