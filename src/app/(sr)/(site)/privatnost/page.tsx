import { metaFor } from "@/content/meta";
import { LegalView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "privacy");

export default function Page() {
  return <LegalView locale="sr" kind="privacy" />;
}
