import { metaFor } from "@/content/meta";
import { SuccessView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "success");

export default function Page() {
  return <SuccessView locale="sr" />;
}
