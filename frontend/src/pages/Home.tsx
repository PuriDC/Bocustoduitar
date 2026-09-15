import Hero from "../components/Hero";
import Philosophy from "../components/Philosophy";
import FeaturedBuild from "../components/FeaturedBuild";
import StatsStrip from "../components/StatsStrip";
import Newsletter from "../components/Newsletter";

export default function Home() {
  return (
    <>
      <Hero />
      <Philosophy />
      <FeaturedBuild />
      <StatsStrip />
      <Newsletter />
    </>
  );
}
