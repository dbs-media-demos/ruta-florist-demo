import { metaFor } from "@/content/meta";
import { SuccessView } from "@/views/InfoViews";

export const metadata = metaFor("en", "success");

export default function Page() {
  return <SuccessView locale="en" />;
}
