import { metaFor } from "@/content/meta";
import { BuilderView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "builder");

export default function Page() {
  return <BuilderView locale="sr" />;
}
