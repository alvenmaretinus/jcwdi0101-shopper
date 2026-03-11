import { VoucherCard } from "@/components/cards/VoucherCard";
import { PromoCard } from "@/lib/promoCardBuilder";

/**
 * Common render function for voucher cards in carousel sections.
 * 
 * @param card - The promo/voucher card data
 * @param index - Index in the carousel
 * @param gradients - Array of gradient configurations
 * @returns Rendered VoucherCard component
 */
export const renderVoucherCard = (
  card: PromoCard,
  index: number,
  gradients: Array<{ from: string; to: string }>
) => (
  <VoucherCard
    key={card.code || card.id || index}
    promo={card}
    gradient={gradients[index % gradients.length]}
  />
);
