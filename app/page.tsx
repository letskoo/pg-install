import HeroSlider from "@/components/hero/HeroSlider";
import BrandHeader from "@/components/BrandHeader";
import HeroContent from "@/components/HeroContent";
import BenefitList from "@/components/BenefitList";
import InfoCard from "@/components/InfoCard";
import BottomCTA from "@/components/BottomCTA";
import StickyTopBar from "@/components/StickyTopBar";

export default function Page() {
  return (
    <main className="min-h-screen bg-white pb-12">
      <div id="hero-sentinel" className="absolute top-0 left-0 w-full h-px pointer-events-none" />
      <StickyTopBar />
      <HeroSlider />
      <BrandHeader />
      <HeroContent />
      <BenefitList />
      <InfoCard />
      <BottomCTA />
    </main>
  );
}
