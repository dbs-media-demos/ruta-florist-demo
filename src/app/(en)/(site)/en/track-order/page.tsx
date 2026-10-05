import { metaFor } from "@/content/meta";
import { TrackView } from "@/views/InfoViews";

export const metadata = metaFor("en", "track");

export default function Page() {
  return <TrackView locale="en" />;
}
