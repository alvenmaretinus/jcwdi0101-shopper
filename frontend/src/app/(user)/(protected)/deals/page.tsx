"use client";

import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Percent, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { getVouchers } from "@/services/voucher";
import { getDiscounts, getProductsWithDiscounts, type ProductWithDiscount } from "@/services/discount";
import { VoucherCard } from "@/components/cards/VoucherCard";
import { buildPromoCards, buildReferralCards, buildStorewideDiscountCards } from "@/lib/promoCardBuilder";
import type { Voucher } from "@/types/Voucher";
import type { Discount } from "@/types/Discount";

const Deals = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [storewideDiscounts, setStorewideDiscounts] = useState<Discount[]>([]);
  const [flashDeals, setFlashDeals] = useState<ProductWithDiscount[]>([]);
  const [bogoProducts, setBogoProducts] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [promoPage, setPromoPage] = useState(1);
  const [storewidePage, setStorewidePage] = useState(1);
  const [referralPage, setReferralPage] = useState(1);
  const [flashPage, setFlashPage] = useState(1);
  
  const PROMO_PER_PAGE = 3;
  const STOREWIDE_PER_PAGE = 3;
  const REFERRAL_PER_PAGE = 3;
  const DEALS_PER_PAGE = 4;

  const formatEndsIn = (endsAt?: string | Date | null) => {
    if (!endsAt) return "";
    const endDate = new Date(endsAt);
    if (Number.isNaN(endDate.getTime())) return "";
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.ceil((endDate.getTime() - Date.now()) / msPerDay);
    if (diffDays <= 0) {
      return ", ends today";
    }
    return `, ends in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vouchersResponse, storewideResponse, percentageDealsResponse, amountDealsResponse, bogoResponse] = await Promise.all([
          getVouchers({ isRedeemed: false }),
          getDiscounts({ isActive: true }),
          getProductsWithDiscounts({ isActive: true, type: "PERCENTAGE" }),
          getProductsWithDiscounts({ isActive: true, type: "FIXED_AMOUNT" }),
          getProductsWithDiscounts({ isActive: true, type: "QUANTITY" }),
        ]);
        
        setVouchers(vouchersResponse.data);
        setStorewideDiscounts(
          storewideResponse.data.filter(
            (discount) => !discount.isTiedToProduct && !discount.isVoucher
          )
        );
        setFlashDeals([...percentageDealsResponse.data, ...amountDealsResponse.data]);
        setBogoProducts(bogoResponse.data);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform vouchers into promo cards using shared utility
  const promoCards = buildPromoCards(vouchers);
  const storewideCards = buildStorewideDiscountCards(storewideDiscounts);
  const referralCards = buildReferralCards(vouchers);

  // Pagination logic
  const totalPromoPages = Math.ceil(promoCards.length / PROMO_PER_PAGE);
  const paginatedPromos = promoCards.slice(
    (promoPage - 1) * PROMO_PER_PAGE,
    promoPage * PROMO_PER_PAGE
  );

  const handlePromoNext = () => {
    if (promoPage < totalPromoPages) setPromoPage(promoPage + 1);
  };

  const handlePromoPrev = () => {
    if (promoPage > 1) setPromoPage(promoPage - 1);
  };

  const totalStorewidePages = Math.ceil(storewideCards.length / STOREWIDE_PER_PAGE);
  const paginatedStorewide = storewideCards.slice(
    (storewidePage - 1) * STOREWIDE_PER_PAGE,
    storewidePage * STOREWIDE_PER_PAGE
  );

  const handleStorewideNext = () => {
    if (storewidePage < totalStorewidePages) setStorewidePage(storewidePage + 1);
  };

  const handleStorewidePrev = () => {
    if (storewidePage > 1) setStorewidePage(storewidePage - 1);
  };

  const totalReferralPages = Math.ceil(referralCards.length / REFERRAL_PER_PAGE);
  const paginatedReferrals = referralCards.slice(
    (referralPage - 1) * REFERRAL_PER_PAGE,
    referralPage * REFERRAL_PER_PAGE
  );

  const handleReferralNext = () => {
    if (referralPage < totalReferralPages) setReferralPage(referralPage + 1);
  };

  const handleReferralPrev = () => {
    if (referralPage > 1) setReferralPage(referralPage - 1);
  };

  // Transform flash deals with discounts - only show in-stock products
  const flashDealGroups = flashDeals.reduce((acc, item) => {
    const productId = item.product?.id;
    if (!productId || !item.product) return acc;
    if (!acc[productId]) {
      acc[productId] = [];
    }
    acc[productId].push(item);
    return acc;
  }, {} as Record<string, ProductWithDiscount[]>);

  const transformedFlashDeals = Object.values(flashDealGroups)
    .map((group) => {
      const product = group[0]?.product;
      if (!product) return null;

      const hasStock = product.productStores?.some((store) => store.quantity > 0);
      if (!hasStock) return null;

      // Calculate discount from the discount items (no backend calculated pricing available)
      const discounts = group;
      if (discounts.length === 0) return null;

      const pricing = product.discountedPricing;
      if (!pricing || pricing.appliedCount === 0) {
        return null;
      }

      const totalDiscount = pricing.totalDiscount;
      const discountedPrice = pricing.discountedPrice;
      const earliestEndsAt = pricing.earliestEndsAt ?? null;
      const discountBadge = pricing.appliedCount > 1
        ? `${pricing.appliedCount} discounts applied`
        : (pricing.appliedDiscounts[0]?.label || `${Math.round((pricing.totalDiscount / product.price) * 100)}% off`);
      const bugoBadge = pricing.quantityDiscounts && pricing.quantityDiscounts.length > 0 ? {
        label: pricing.quantityDiscounts.length > 1
          ? `${pricing.quantityDiscounts.length} BXGY offers`
          : `Buy ${pricing.quantityDiscounts[0].buyQuantity} get ${pricing.quantityDiscounts[0].freeQuantity} free`,
        endsAt: pricing.quantityDiscounts[0].endsAt ?? null,
      } : undefined;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: discountedPrice,
        originalPrice: product.price,
        savingsAmount: totalDiscount,
        weight: product.weight,
        categoryId: product.categoryId,
        category: {
          id: product.category?.id || product.categoryId,
          category: product.category?.category || "Products",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        productImages: (product.productImages || []).map((img) => ({
          ...img,
          productId: product.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        productStores: product.productStores || [],
        isSoftDeleted: false,
        createAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        discountBadge:
          discountBadge,
        bugoBadge,
        endsAt: earliestEndsAt,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const flashDealCards = transformedFlashDeals.map((product) => ({
    product,
    discountBadge: {
      label: product.discountBadge || "",
      endsAt: product.endsAt,
    },
    bugoBadge: product.bugoBadge,
  }));

  const bogoDealGroups = bogoProducts.reduce((acc, item) => {
    const productId = item.product?.id;
    if (!productId || !item.product) return acc;
    if (!acc[productId]) {
      acc[productId] = [];
    }
    acc[productId].push(item);
    return acc;
  }, {} as Record<string, ProductWithDiscount[]>);

  const bogoDealCards = Object.values(bogoDealGroups)
    .map((group) => {
      const product = group[0]?.product;
      if (!product) return null;

      const hasStock = product.productStores?.some((store) => store.quantity > 0);
      if (!hasStock) return null;

      const bogoDiscount = group[0];
      if (!bogoDiscount.buyQuantity || !bogoDiscount.freeQuantity) return null;

      const endsAtList = group
        .map((discount) => (discount.endsAt ? new Date(discount.endsAt) : null))
        .filter((date): date is Date => !!date && !Number.isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      const earliestEndsAt = endsAtList[0] ?? null;

      return {
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          weight: product.weight,
          categoryId: product.categoryId,
          category: {
            id: product.category?.id || product.categoryId,
            category: product.category?.category || "Products",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          productImages: (product.productImages || []).map((img) => ({
            ...img,
            productId: product.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })),
          productStores: product.productStores || [],
          isSoftDeleted: false,
          createAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        discountBadge: {
          label: "BXGY",
          endsAt: earliestEndsAt,
        },
        bugoBadge: {
          label: group.length > 1
            ? `${group.length} BXGY offers`
            : `Buy ${bogoDiscount.buyQuantity} get ${bogoDiscount.freeQuantity} free`,
          endsAt: earliestEndsAt,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const combinedDeals = [...flashDealCards, ...bogoDealCards];

  // Deals pagination
  const totalFlashPages = Math.ceil(combinedDeals.length / DEALS_PER_PAGE);
  const paginatedFlashDeals = combinedDeals.slice(
    (flashPage - 1) * DEALS_PER_PAGE,
    flashPage * DEALS_PER_PAGE
  );

  const handleFlashNext = () => {
    if (flashPage < totalFlashPages) setFlashPage(flashPage + 1);
  };

  const handleFlashPrev = () => {
    if (flashPage > 1) setFlashPage(flashPage - 1);
  };

  // Gradient colors for voucher cards
  const gradientsPink = [
    { from: "#ec4899", to: "#e11d48" },
    { from: "#a855f7", to: "#7c3aed" },
    { from: "#3b82f6", to: "#06b6d4" },
    { from: "#22c55e", to: "#10b981" },
    { from: "#eab308", to: "#f97316" },
    { from: "#ef4444", to: "#ec4899" },
    { from: "#6366f1", to: "#a855f7" },
    { from: "#14b8a6", to: "#22c55e" },
    { from: "#f97316", to: "#f59e0b" },
    { from: "#d946ef", to: "#ec4899" },
  ];

  const gradientsBlue = [
    { from: "#4f46e5", to: "#7c3aed" },
    { from: "#0891b2", to: "#2563eb" },
    { from: "#0d9488", to: "#14b8a6" },
    { from: "#9333ea", to: "#ec4899" },
    { from: "#0ea5e9", to: "#6366f1" },
    { from: "#0f766e", to: "#0ea5e9" },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading deals...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        {/* Hero Banner */}
        <div className="text-white" style={{ background: 'linear-gradient(to right, #ec4899, #db2777, #ec4899)' }}>
          <div className="container-app py-12 md:py-16">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-6 w-6" />
                  <span className="font-semibold">Special Offers</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Today's Best Deals
                </h1>
                <p className="text-lg text-white/80 max-w-lg">
                  Save big on fresh groceries! Limited time offers on your favorite products.
                </p>
              </div>
              <div className="leading-none animate-bounce" style={{ fontSize: "220px" }}>🏷️</div>
            </div>
          </div>
        </div>

        <div className="container-app py-12">
          {/* Promo Cards */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" />
                Promo Codes
              </h2>
              {totalPromoPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePromoPrev}
                    disabled={promoPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {promoPage} / {totalPromoPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePromoNext}
                    disabled={promoPage === totalPromoPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {paginatedPromos.map((promo, index) => (
                <VoucherCard
                  key={promo.code || index}
                  promo={promo}
                  gradient={gradientsPink[((promoPage - 1) * PROMO_PER_PAGE + index) % gradientsPink.length]}
                />
              ))}
            </div>
          </section>

          {/* Storewide Discounts */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-2xl">🛍️</span>
                Storewide Discounts
              </h2>
              {totalStorewidePages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStorewidePrev}
                    disabled={storewidePage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {storewidePage} / {totalStorewidePages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStorewideNext}
                    disabled={storewidePage === totalStorewidePages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {paginatedStorewide.length > 0 ? (
                paginatedStorewide.map((promo, index) => (
                  <VoucherCard
                    key={promo.id || index}
                    promo={promo}
                    gradient={gradientsBlue[((storewidePage - 1) * STOREWIDE_PER_PAGE + index) % gradientsBlue.length]}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No storewide discounts available at the moment
                </div>
              )}
            </div>
          </section>

          {/* Referral Voucher Cards */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-2xl">🤝</span>
                Referral Vouchers
              </h2>
              {totalReferralPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReferralPrev}
                    disabled={referralPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {referralPage} / {totalReferralPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReferralNext}
                    disabled={referralPage === totalReferralPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {paginatedReferrals.length > 0 ? (
                paginatedReferrals.map((promo, index) => (
                  <VoucherCard
                    key={`${promo.code}-${index}`}
                    promo={promo}
                    gradient={gradientsBlue[((referralPage - 1) * REFERRAL_PER_PAGE + index) % gradientsBlue.length]}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                  No referral vouchers available at the moment
                </div>
              )}
            </div>
          </section>

          {/* Deals */}
          <section className="mb-16">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Percent className="h-6 w-6 text-pink-600" />
                  Deals
                </h2>
                {totalFlashPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFlashPrev}
                      disabled={flashPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {flashPage} / {totalFlashPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFlashNext}
                      disabled={flashPage === totalFlashPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {paginatedFlashDeals.length > 0 ? (
                paginatedFlashDeals.map((deal) => (
                  <ProductCard 
                    key={deal.product.id} 
                    product={deal.product}
                    discountBadge={deal.discountBadge}
                    bugoBadge={deal.bugoBadge}
                  />
                ))
              ) : (
                <div className="col-span-4 text-center py-8 text-muted-foreground">
                  No deals available at the moment
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </Layout>
  );
};

export default Deals;
