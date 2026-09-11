import Image from "next/image";

// Club background — replace with an official club photo when available.
export const SITE_BG_IMAGE = "/bg-merdeka-118.jpg";

export function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Image
        src={SITE_BG_IMAGE}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
        quality={85}
      />
      {/* Same treatment on every page — dark tint keeps the photo vivid (not washed out). */}
      <div className="absolute inset-0 bg-black/15 dark:bg-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-black/30 dark:from-black/30 dark:via-black/10 dark:to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10 dark:from-black/40 dark:to-black/15" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/55 to-transparent dark:from-background/65" />
    </div>
  );
}
