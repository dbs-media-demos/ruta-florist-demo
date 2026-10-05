import { metaFor } from "@/content/meta";
import { WeddingsView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "weddings");

export default function Page() {
  return <WeddingsView locale="sr" />;
}
