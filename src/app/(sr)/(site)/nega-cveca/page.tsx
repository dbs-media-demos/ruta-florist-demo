import { metaFor } from "@/content/meta";
import { CareView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "care");

export default function Page() {
  return <CareView locale="sr" />;
}
