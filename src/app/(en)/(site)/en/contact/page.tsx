import { metaFor } from "@/content/meta";
import { ContactView } from "@/views/InfoViews";

export const metadata = metaFor("en", "contact");

export default function Page() {
  return <ContactView locale="en" />;
}
