import { HomeHero } from "@/components/home-hero";
import { HomeExplore } from "@/components/home/home-explore";

export const revalidate = 60;

export default function Home() {
  return (
    <div>
      <HomeHero />
      <HomeExplore />
    </div>
  );
}
