"use client";

import { useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { useUserDealsStore } from "@/store/user/useUserDealsStore";
import { PromoCardsSection } from "./_components/PromoCardsSection";
import { StorewideDiscountsSection } from "./_components/StorewideDiscountsSection";
import { ReferralVouchersSection } from "./_components/ReferralVouchersSection";
import { DealsSection } from "./_components/DealsSection";


const Deals = () => {
  const initialize = useUserDealsStore((state) => state.initialize);
 
  // Initialize store data on mount - fetch all deals data in parallel and set loading state
  useEffect(() => {
    initialize();
  }, [initialize]); // Zustand store functions are stable, but we include it in dependencies for clarity

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        {/* Hero Banner */}
        <HeroBanner />

        <div className="container-app py-12">
          {/* Promo Cards */}
          <PromoCardsSection />

          {/* Storewide Discounts */}
          <StorewideDiscountsSection />

          {/* Referral Voucher Cards */}
          <ReferralVouchersSection />

          {/* Deals */}
          <DealsSection />
        </div>
      </div>
    </Layout>
  );
};

export default Deals;
