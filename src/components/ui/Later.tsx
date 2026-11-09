import { Suspense, type CSSProperties, type ReactNode } from "react";

/**
 * Phones: the browser skips laying out and painting this section until it nears
 * the screen (content-visibility), holding the height it will really have so the page never
 * jumps. Heights measured on the production build with scripts/section-heights.mjs: phones
 * 360–430 and 431–767 px get fitted a + b·vw, 320 px its measured height. Re-measure after changing a
 * section's phone layout. Tablets and desktop: no effect. The HTML is all there either way.
 *
 * Each section is also its own Suspense boundary, so React hydrates them one by one in short
 * tasks (yielding to the browser in between) instead of in one long task.
 */
const H = {
  today: ["calc(1193px - 39.3vw)", "1071px", "calc(1362px - 67.4vw)"],
  best: ["calc(330px + 84.4vw)", "633px", "calc(899px - 23.9vw)"],
  reviews: ["calc(1478px - 100vw)", "1165px", "calc(1082px - 9.7vw)"],
  occasions: ["calc(305px + 98.3vw)", "620px", "calc(299px + 99.7vw)"],
  week: ["calc(910px + 44vw)", "1020px", "calc(1090px + 1.1vw)"],
  studio: ["100svh", "100svh", "100svh"],
  builder: ["calc(654px + 80.6vw)", "910px", "calc(941px + 30.2vw)"],
  zones: ["calc(686px + 77.1vw)", "960px", "calc(710px + 63.4vw)"],
  subs: ["calc(3944px - 379.6vw)", "2686px", "calc(2408px - 11.3vw)"],
  doors: ["calc(207px + 187.2vw)", "806px", "calc(265px + 174.2vw)"],
  final: ["calc(1181px - 142.5vw)", "687px", "calc(509px + 8.7vw)"],
} satisfies Record<string, [phone: string, small: string, large: string]>;

export type LaterId = keyof typeof H;

export function Later({ id, children }: { id: LaterId; children: ReactNode }) {
  const [phone, small, large] = H[id];
  return (
    <div data-cv={id} style={{ "--cv": phone, "--cv-s": small, "--cv-l": large } as CSSProperties}>
      <Suspense>{children}</Suspense>
    </div>
  );
}
