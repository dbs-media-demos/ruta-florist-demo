import { metaFor } from "@/content/meta";
import { BuilderView } from "@/views/InfoViews";

export const metadata = metaFor("en", "builder");

export default function Page() {
  return <BuilderView locale="en" />;
}
