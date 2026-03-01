"use client";

import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Percent, Gift } from "lucide-react";
import { getVouchers } from "@/services/voucher";
import { getDiscounts, getProductsWithDiscounts, type ProductWithDiscount } from "@/services/discount";
import { VoucherCard } from "@/components/cards/VoucherCard";
import { buildPromoCards, buildReferralCards, buildStorewideDiscountCards } from "@/lib/promoCardBuilder";
import { CardCarouselSection } from "@/components/sections/CardCarouselSection";
import { DealsCarouselSection } from "@/components/sections/DealsCarouselSection";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { gradientsPink, gradientsBlue } from "@/constants/gradients";
import type { Voucher } from "@/types/Voucher";
import type { Discount } from "@/types/Discount";

const Deals = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [storewideDiscounts, setStorewideDiscounts] = useState<Discount[]>([]);
  const [flashDeals, setFlashDeals] = useState<ProductWithDiscount[]>([]);
  const [bogoProducts, setBogoProducts] = useState<ProductWithDiscount[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      
      // BXGY/Quantity discount badge
      const bugoBadge = pricing.quantityDiscounts && pricing.quantityDiscounts.length > 0 ? {
        label: pricing.quantityDiscounts.length > 1
          ? `${pricing.quantityDiscounts.length} BXGY offers`
          : `Buy ${pricing.quantityDiscounts[0].buyQuantity} get ${pricing.quantityDiscounts[0].freeQuantity} free`,
        endsAt: pricing.quantityDiscounts[0].endsAt ?? null,
      } : undefined;
      
      // Regular discount badge (percentage/amount)
      // Note: appliedCount only includes percentage/amount discounts, NOT quantity discounts
      const discountBadge = pricing.appliedCount > 0 ? (
        pricing.appliedCount > 1
          ? `${pricing.appliedCount} discounts applied`
          : (pricing.appliedDiscounts[0]?.label || `${Math.round((pricing.totalDiscount / product.price) * 100)}% off`)
      ) : undefined;

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
          name: product.category?.name || "Products",
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
    discountBadge: product.discountBadge ? {
      label: product.discountBadge,
      endsAt: product.endsAt,
    } : undefined,
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
            name: product.category?.name || "Products",
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
        discountBadge: undefined,
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

  // Render functions for CardCarouselSection
  const renderPromoCard = (promo: any, index: number, gradients: Array<{ from: string; to: string }>) => (
    <VoucherCard
      key={promo.code || index}
      promo={promo}
      gradient={gradients[index % gradients.length]}
    />
  );

  const renderVoucherCard = (card: any, index: number, gradients: Array<{ from: string; to: string }>) => (
    <VoucherCard
      key={card.id || index}
      promo={card}
      gradient={gradients[index % gradients.length]}
    />
  );

  return (
    <Layout>
      <div className="bg-muted/30 min-h-screen">
        {/* Hero Banner */}
        <HeroBanner />

        <div className="container-app py-12">
          {/* Promo Cards */}
          <CardCarouselSection
            title="Promo Codes"
            icon={<Gift className="h-6 w-6 text-primary" />}
            items={promoCards}
            itemsPerPage={PROMO_PER_PAGE}
            gradients={gradientsPink}
            renderCard={renderPromoCard}
          />

          {/* Storewide Discounts */}
          <CardCarouselSection
            title="Storewide Discounts"
            icon={<span className="text-2xl">🛍️</span>}
            items={storewideCards}
            itemsPerPage={STOREWIDE_PER_PAGE}
            gradients={gradientsBlue}
            renderCard={renderVoucherCard}
            emptyMessage="No storewide discounts available at the moment"
          />

          {/* Referral Voucher Cards */}
          <CardCarouselSection
            title="Referral Vouchers"
            icon={<span className="text-2xl">🤝</span>}
            items={referralCards}
            itemsPerPage={REFERRAL_PER_PAGE}
            gradients={gradientsBlue}
            renderCard={renderVoucherCard}
            emptyMessage="No referral vouchers available at the moment"
          />

          {/* Deals */}
          <DealsCarouselSection
            title="Deals"
            icon={<Percent className="h-6 w-6 text-pink-600" />}
            deals={combinedDeals}
            dealsPerPage={DEALS_PER_PAGE}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Deals;
