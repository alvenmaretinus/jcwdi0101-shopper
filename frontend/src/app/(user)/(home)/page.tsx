import AdminRedirect from "./_components/AdminRedirect";
import { HeroSection } from "./_components/Home/HeroSection";
import { ProductSection } from "./_components/Home/ProductSection";
import { ReferralCodeModal } from "./_components/Home/ReferralCodeModal";

export default function HomePage() {
  return (
    <>
      <AdminRedirect />
      <HeroSection />
      <ProductSection />
      <ReferralCodeModal />
    </>
  );
}
