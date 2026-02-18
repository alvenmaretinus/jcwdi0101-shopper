import { prisma } from "../../src/lib/db/prisma";

export async function seedVouchers() {
  console.log("🎫 Seeding vouchers...");

  // Clear existing vouchers
  await prisma.voucher.deleteMany();

  // Get discount IDs
  const freshProduceDiscount = await prisma.discount.findFirst({
    where: { id: "discount-fresh-produce-30" },
  });
  
  const dairyDiscount = await prisma.discount.findFirst({
    where: { id: "discount-dairy-b2g1" },
  });
  
  const freeDeliveryDiscount = await prisma.discount.findFirst({
    where: { id: "discount-free-delivery" },
  });

  if (!freshProduceDiscount || !dairyDiscount || !freeDeliveryDiscount) {
    console.error("❌ Required discounts not found. Please run seedDiscounts first.");
    return;
  }

  const vouchers = [
    {
      code: "FRESH30",
      discountId: freshProduceDiscount.id,
      voucherType: "TRANSACTIONAL",
      isRedeemed: false,
    },
    {
      code: "DAIRY3",
      discountId: dairyDiscount.id,
      voucherType: "TRANSACTIONAL",
      isRedeemed: false,
    },
    {
      code: "FREEDELIVERY",
      discountId: freeDeliveryDiscount.id,
      voucherType: "FREEDELIVERY",
      isRedeemed: false,
    },
  ];

  for (const voucher of vouchers) {
    await prisma.voucher.create({
      data: voucher,
    });
  }

  console.log(`✅ Created ${vouchers.length} vouchers`);
}
