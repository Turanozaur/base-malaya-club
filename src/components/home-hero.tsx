import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center">
      {/* Extra contrast for hero text over the global background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent dark:from-black/60 dark:via-black/35" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16">
        <span className="mb-4 inline-block rounded-full border border-white/20 bg-black/30 px-3 py-1 text-xs text-white/90 backdrop-blur-sm">
          The BASE jumping community of Malaysia
        </span>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white drop-shadow-sm sm:text-6xl">
          BASE Malaya Club
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/90 drop-shadow-sm">
          Legal jumps from KL Tower to Merdeka 118. Events, gallery, education
          and a verified community of jumpers — membership by application.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/register" />}
            className="bg-white text-black hover:bg-white/90"
          >
            Apply to join
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/events" />}
            className="border-white/40 bg-black/20 text-white backdrop-blur-sm hover:bg-black/40 hover:text-white"
          >
            Upcoming events
          </Button>
        </div>
      </div>
    </section>
  );
}
