import { CategorySection } from "./_components/Home/CategorySection";
import { HeroSection } from "./_components/Home/HeroSection";
import { ProductSection } from "./_components/Home/ProductSection";
import { ReferralCodeModal } from "./_components/Home/ReferralCodeModal";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <ProductSection />
      <ReferralCodeModal />
    </>
  );
}
