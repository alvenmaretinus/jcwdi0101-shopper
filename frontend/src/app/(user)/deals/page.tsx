"use client";

import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Clock, Sparkles, Percent, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { getVouchers } from "@/services/voucher";
import { getProductsWithDiscounts, type ProductWithDiscount } from "@/services/discount";
import type { Voucher } from "@/types/Voucher";

interface PromoCard {
  title: string;
  description: string;
  discount: string;
  code: string;
  emoji: string;
  expiresIn: string;
  remainingUses: string;
}

const Deals = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [flashDeals, setFlashDeals] = useState<ProductWithDiscount[]>([]);
  const [bogoProducts, setBogoProducts] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [promoPage, setPromoPage] = useState(1);
  const [referralPage, setReferralPage] = useState(1);
  const [flashPage, setFlashPage] = useState(1);
  const [bogoPage, setBogoPage] = useState(1);
  
  const PROMO_PER_PAGE = 3;
  const REFERRAL_PER_PAGE = 3;
  const DEALS_PER_PAGE = 4;
  const BOGO_PER_PAGE = 4;

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

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  const getRemainingUsesLabel = (isLimited?: boolean, limit?: number, useCounter?: number) => {
    if (!isLimited) return "Unlimited";
    const totalLimit = typeof limit === "number" ? limit : 0;
    const used = typeof useCounter === "number" ? useCounter : 0;
    return String(Math.max(0, totalLimit - used));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vouchersResponse, percentageDealsResponse, amountDealsResponse, bogoResponse] = await Promise.all([
          getVouchers({ isRedeemed: false }),
          getProductsWithDiscounts({ isActive: true, type: "PERCENTAGE" }),
          getProductsWithDiscounts({ isActive: true, type: "FIXED_AMOUNT" }),
          getProductsWithDiscounts({ isActive: true, type: "QUANTITY" }),
        ]);
        
        setVouchers(vouchersResponse.data);
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

  // Transform vouchers into promo cards
  const promoCards: PromoCard[] = vouchers
    .filter((voucher) => voucher.voucherType !== "REFERRAL")
    .map((voucher) => {
    const discount = voucher.discount;
    let discountDisplay = "";
    let description = "";
    let emoji = "🎁";

    if (discount.type === "PERCENTAGE" && discount.percentage) {
      discountDisplay = `${discount.percentage}%`;
      description = `Get ${discount.percentage}% off`;
    } else if (discount.type === "QUANTITY" && discount.buyQuantity && discount.freeQuantity) {
      discountDisplay = `B${discount.buyQuantity}G${discount.freeQuantity}`;
      description = `Buy ${discount.buyQuantity}, get ${discount.freeQuantity} free`;
    } else if (discount.type === "FIXED_AMOUNT") {
      discountDisplay = "FREE";
      description = discount.isWithMinimum 
        ? `Free delivery on orders above Rp ${discount.minimumPrice?.toLocaleString()}`
        : "Free delivery";
    }

    // Set emoji based on voucher type
    if (voucher.voucherType === "FREEDELIVERY") {
      emoji = "🚚";
    } else if (discount.name.toLowerCase().includes("dairy")) {
      emoji = "🧀";
    } else if (discount.name.toLowerCase().includes("produce") || discount.name.toLowerCase().includes("fresh")) {
      emoji = "🥗";
    }

    // Calculate expiration
    let expiresIn = "Ongoing";
    if (discount.endsAt) {
      const now = new Date();
      const endDate = new Date(discount.endsAt);
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        expiresIn = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        expiresIn = "Expires soon";
      }
    }

    return {
      title: discount.name,
      description,
      discount: discountDisplay,
      code: voucher.code,
      emoji,
      expiresIn,
      remainingUses: getRemainingUsesLabel(discount.isLimited, discount.limit, discount.useCounter),
    };
    });

  const referralCards: PromoCard[] = vouchers
    .filter((voucher) => voucher.voucherType === "REFERRAL")
    .map((voucher) => {
      const discount = voucher.discount;
      let discountDisplay = "REF";
      const roleLabel = voucher.referralRole === "REFERRER" ? "For Referrer" : "For Referred User";
      let description = `${roleLabel}: referral reward voucher`;

      if (discount.type === "PERCENTAGE" && discount.percentage) {
        discountDisplay = `${discount.percentage}%`;
        description = `${roleLabel}: ${discount.percentage}% off`;
      } else if (discount.type === "FIXED_AMOUNT" && discount.amount) {
        discountDisplay = formatRupiah(discount.amount);
        description = `${roleLabel}: ${formatRupiah(discount.amount)} off`;
      }

      if (discount.isWithMinimum && discount.minimumPrice) {
        description += ` (min. ${formatRupiah(discount.minimumPrice)})`;
      }

      let expiresIn = "Ongoing";
      if (discount.endsAt) {
        const now = new Date();
        const endDate = new Date(discount.endsAt);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          expiresIn = `${diffDays} day${diffDays > 1 ? "s" : ""}`;
        } else {
          expiresIn = "Expires soon";
        }
      }

      return {
        title: `${discount.name} (${roleLabel})`,
        description,
        discount: discountDisplay,
        code: voucher.code,
        emoji: voucher.referralRole === "REFERRER" ? "🎉" : "🎁",
        expiresIn,
        remainingUses: getRemainingUsesLabel(discount.isLimited, discount.limit, discount.useCounter),
      };
    });

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

  const calculateStackedDiscount = (price: number, discounts: ProductWithDiscount[]) => {
    const validDiscounts = discounts.filter((discount) => {
      if (discount.type !== "PERCENTAGE" && discount.type !== "FIXED_AMOUNT") return false;
      if (discount.isWithMinimum && discount.minimumPrice && price < discount.minimumPrice) {
        return false;
      }
      return true;
    });

    if (validDiscounts.length === 0) {
      return {
        discountedPrice: price,
        totalDiscount: 0,
        appliedCount: 0,
        primaryLabel: null as string | null,
      };
    }

    const percentageDiscounts = validDiscounts
      .filter((discount) => discount.type === "PERCENTAGE")
      .sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));

    const amountDiscounts = validDiscounts
      .filter((discount) => discount.type === "FIXED_AMOUNT")
      .sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0));

    let totalDiscount = 0;
    let remainingPrice = price;
    let appliedCount = 0;
    let firstApplied: ProductWithDiscount | null = null;

    while (percentageDiscounts.length > 0 && amountDiscounts.length > 0 && remainingPrice > 0) {
      const pctDiscount = percentageDiscounts[0];
      const amtDiscount = amountDiscounts[0];

      const pctAmount = remainingPrice * (Number(pctDiscount.percentage ?? 0) / 100);
      const amtAmount = Number(amtDiscount.amount ?? 0);

      if (pctAmount >= amtAmount) {
        const actualDiscount = Math.min(pctAmount, remainingPrice);
        if (actualDiscount > 0) {
          totalDiscount += actualDiscount;
          remainingPrice -= actualDiscount;
          appliedCount += 1;
          if (!firstApplied) firstApplied = pctDiscount;
        }
        percentageDiscounts.shift();
      } else {
        const actualDiscount = Math.min(amtAmount, remainingPrice);
        if (actualDiscount > 0) {
          totalDiscount += actualDiscount;
          remainingPrice -= actualDiscount;
          appliedCount += 1;
          if (!firstApplied) firstApplied = amtDiscount;
        }
        amountDiscounts.shift();
      }
    }

    while (percentageDiscounts.length > 0 && remainingPrice > 0) {
      const pctDiscount = percentageDiscounts.shift();
      if (!pctDiscount) break;
      const pctAmount = remainingPrice * (Number(pctDiscount.percentage ?? 0) / 100);
      const actualDiscount = Math.min(pctAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
        appliedCount += 1;
        if (!firstApplied) firstApplied = pctDiscount;
      }
    }

    while (amountDiscounts.length > 0 && remainingPrice > 0) {
      const amtDiscount = amountDiscounts.shift();
      if (!amtDiscount) break;
      const amtAmount = Number(amtDiscount.amount ?? 0);
      const actualDiscount = Math.min(amtAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
        appliedCount += 1;
        if (!firstApplied) firstApplied = amtDiscount;
      }
    }

    const discountedPrice = Math.max(0, Math.round(price - totalDiscount));

    let primaryLabel: string | null = null;
    if (firstApplied) {
      if (firstApplied.type === "PERCENTAGE") {
        primaryLabel = `${firstApplied.percentage}% off`;
      } else {
        primaryLabel = `${formatRupiah(Number(firstApplied.amount ?? 0))} off`;
      }
    }

    return {
      discountedPrice,
      totalDiscount: Math.round(totalDiscount),
      appliedCount,
      primaryLabel,
    };
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

      const pricing = calculateStackedDiscount(product.price, group);
      if (pricing.appliedCount === 0) return null;

      const endsAtList = group
        .map((discount) => (discount.endsAt ? new Date(discount.endsAt) : null))
        .filter((date): date is Date => !!date && !Number.isNaN(date.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());

      const earliestEndsAt = endsAtList[0] ?? null;

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: pricing.discountedPrice,
        originalPrice: product.price,
        savingsAmount: pricing.totalDiscount,
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
          pricing.appliedCount > 1
            ? `${pricing.appliedCount} discounts applied`
            : (pricing.primaryLabel ?? `${formatRupiah(pricing.totalDiscount)} off`),
        endsAt: earliestEndsAt,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  // Transform BOGO products - only show in-stock products
  const transformedBogoProducts = bogoProducts
    .filter((item) => {
      if (!item.product) return false;
      // Check if product has stock in any store
      const hasStock = item.product.productStores?.some(
        (store) => store.quantity > 0
      );
      return hasStock;
    })
    .map((item) => {
      const product = item.product!;

      return {
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
        productImages: (product.productImages || []).map(img => ({
          ...img,
          productId: product.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        productStores: product.productStores || [],
        isSoftDeleted: false,
        createAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

  // Flash deals pagination
  const totalFlashPages = Math.ceil(transformedFlashDeals.length / DEALS_PER_PAGE);
  const paginatedFlashDeals = transformedFlashDeals.slice(
    (flashPage - 1) * DEALS_PER_PAGE,
    flashPage * DEALS_PER_PAGE
  );

  const handleFlashNext = () => {
    if (flashPage < totalFlashPages) setFlashPage(flashPage + 1);
  };

  const handleFlashPrev = () => {
    if (flashPage > 1) setFlashPage(flashPage - 1);
  };

  // BOGO products pagination
  const totalBogoPages = Math.ceil(transformedBogoProducts.length / BOGO_PER_PAGE);
  const paginatedBogoProducts = transformedBogoProducts.slice(
    (bogoPage - 1) * BOGO_PER_PAGE,
    bogoPage * BOGO_PER_PAGE
  );
  const paginatedBogoData = bogoProducts.slice(
    (bogoPage - 1) * BOGO_PER_PAGE,
    bogoPage * BOGO_PER_PAGE
  );

  const handleBogoNext = () => {
    if (bogoPage < totalBogoPages) setBogoPage(bogoPage + 1);
  };

  const handleBogoPrev = () => {
    if (bogoPage > 1) setBogoPage(bogoPage - 1);
  };

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
              <h2 className="section-title flex items-center gap-2">
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
              {paginatedPromos.map((promo, index) => {
                // Get gradient colors based on index
                const gradients = [
                  { from: "#ec4899", to: "#e11d48" }, // pink to rose
                  { from: "#a855f7", to: "#7c3aed" }, // purple to violet
                  { from: "#3b82f6", to: "#06b6d4" }, // blue to cyan
                  { from: "#22c55e", to: "#10b981" }, // green to emerald
                  { from: "#eab308", to: "#f97316" }, // yellow to orange
                  { from: "#ef4444", to: "#ec4899" }, // red to pink
                  { from: "#6366f1", to: "#a855f7" }, // indigo to purple
                  { from: "#14b8a6", to: "#22c55e" }, // teal to green
                  { from: "#f97316", to: "#f59e0b" }, // orange to amber
                  { from: "#d946ef", to: "#ec4899" }, // fuchsia to pink
                ];
                const gradient = gradients[((promoPage - 1) * PROMO_PER_PAGE + index) % gradients.length];
                
                return (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-2xl text-white p-6"
                    style={{
                      background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`
                    }}
                  >
                    <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
                      {promo.emoji}
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                        <Clock className="h-4 w-4" />
                        <span>{promo.expiresIn}</span>
                      </div>
                      <div className="text-3xl font-bold mb-2">{promo.discount}</div>
                      <h3 className="text-lg font-bold mb-2">{promo.title}</h3>
                      <p className="text-white/80 text-sm mb-4">{promo.description}</p>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                        <span className="text-sm">Code: </span>
                        <span className="font-mono font-bold">{promo.code}</span>
                      </div>
                      <p className="text-xs text-white/80 mt-2">
                        Remaining uses: {promo.remainingUses}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Referral Voucher Cards */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-2">
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
                paginatedReferrals.map((promo, index) => {
                  const gradients = [
                    { from: "#4f46e5", to: "#7c3aed" },
                    { from: "#0891b2", to: "#2563eb" },
                    { from: "#0d9488", to: "#14b8a6" },
                    { from: "#9333ea", to: "#ec4899" },
                    { from: "#0ea5e9", to: "#6366f1" },
                    { from: "#0f766e", to: "#0ea5e9" },
                  ];
                  const gradient = gradients[((referralPage - 1) * REFERRAL_PER_PAGE + index) % gradients.length];

                  return (
                    <div
                      key={`${promo.code}-${index}`}
                      className="relative overflow-hidden rounded-2xl text-white p-6"
                      style={{
                        background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`
                      }}
                    >
                      <div className="absolute -right-4 -bottom-4 text-8xl opacity-20">
                        {promo.emoji}
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                          <Clock className="h-4 w-4" />
                          <span>{promo.expiresIn}</span>
                        </div>
                        <div className="text-3xl font-bold mb-2">{promo.discount}</div>
                        <h3 className="text-lg font-bold mb-2">{promo.title}</h3>
                        <p className="text-white/80 text-sm mb-4">{promo.description}</p>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                          <span className="text-sm">Code: </span>
                          <span className="font-mono font-bold">{promo.code}</span>
                        </div>
                        <p className="text-xs text-white/80 mt-2">
                          Remaining uses: {promo.remainingUses}
                        </p>
                      </div>
                    </div>
                  );
                })
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
                <h2 className="section-title flex items-center gap-2">
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
                paginatedFlashDeals.map((product) => {
                  
                  return (
                    <div key={product.id} className="relative pt-4">
                      {/* Discount Percentage Badge */}
                      {product.discountBadge && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                          <div className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap" style={{ background: 'linear-gradient(to right, #ec4899, #db2777)' }}>
                            {product.discountBadge}{formatEndsIn(product.endsAt)}
                          </div>
                        </div>
                      )}
                      <ProductCard product={product} />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-8 text-muted-foreground">
                  No deals available at the moment
                </div>
              )}
            </div>
          </section>

          {/* Buy One Get One */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                Buy X Get Y Free
              </h2>
              {totalBogoPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBogoPrev}
                    disabled={bogoPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {bogoPage} / {totalBogoPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBogoNext}
                    disabled={bogoPage === totalBogoPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {paginatedBogoProducts.length > 0 ? (
                paginatedBogoData.map((item, index) => {
                  const product = paginatedBogoProducts[index];
                  if (!product) return null;
                  
                  return (
                    <div key={product.id} className="relative pt-4">
                      {/* Buy X Get Y Badge */}
                      {item.buyQuantity && item.freeQuantity && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                          <div className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap" style={{ background: 'linear-gradient(to right, #f97316, #dc2626)' }}>
                            Buy {item.buyQuantity} get {item.freeQuantity} free{formatEndsIn(item.endsAt)}
                          </div>
                        </div>
                      )}
                      <ProductCard product={product} />
                    </div>
                  );
                })
              ) : (
                <div className="col-span-4 text-center py-8 text-muted-foreground">
                  No BXGY deals available at the moment
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
