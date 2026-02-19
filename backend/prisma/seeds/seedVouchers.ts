import { prisma } from "../../src/lib/db/prisma";

export async function seedVouchers() {
  console.log("🎫 Seeding vouchers...");

  // Clear existing vouchers
  await prisma.voucher.deleteMany();

  // Get discount IDs
  const freshProduceDiscount = await prisma.discount.findFirst({
    where: { name: "Weekend Fresh Produce" },
  });
  
  const dairyDiscount = await prisma.discount.findFirst({
    where: { name: "Dairy Delights Buy 2 Get 1" },
  });
  
  const freeDeliveryDiscount = await prisma.discount.findFirst({
    where: { name: "Free Delivery on Orders Above 150k" },
  });

  const megaWeekendDiscount = await prisma.discount.findFirst({
    where: { name: "Mega Weekend Sale" },
  });

  const fruitBasketDiscount = await prisma.discount.findFirst({
    where: { name: "Fruit Basket Special" },
  });

  const newCustomerDiscount = await prisma.discount.findFirst({
    where: { name: "New Customer Welcome" },
  });

  const snacksDiscount = await prisma.discount.findFirst({
    where: { name: "Buy 3 Get 1 Snacks" },
  });

  const midWeekDiscount = await prisma.discount.findFirst({
    where: { name: "Mid-Week Flash Sale" },
  });

  const freeDelivery100kDiscount = await prisma.discount.findFirst({
    where: { name: "Free Delivery for Orders Above 100k" },
  });

  // Check if at least the basic discounts exist
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

  // Add additional vouchers if discounts exist
  if (megaWeekendDiscount) {
    vouchers.push({
      code: "MEGAWEEKEND",
      discountId: megaWeekendDiscount.id,
      voucherType: "TRANSACTIONAL",
      isRedeemed: false,
    });
  }

  if (fruitBasketDiscount) {
    vouchers.push({
      code: "FRUITBASKET",
      discountId: fruitBasketDiscount.id,
      voucherType: "TRANSACTIONAL",
      isRedeemed: false,
    });
  }

  if (newCustomerDiscount) {
    vouchers.push({
      code: "WELCOME20",
      discountId: newCustomerDiscount.id,
      voucherType: "TRANSACTIONAL",
      isRedeemed: false,
    });
  }

  if (snacksDiscount) {
    vouchers.push({
      code: "SNACKS3FOR1",
      discountId: snacksDiscount.id,
      voucherType: "TRANSACTIONAL",
      isRedeemed: false,
    });
  }

  if (midWeekDiscount) {
    vouchers.push({
      code: "MIDWEEK35",
      discountId: midWeekDiscount.id,
      voucherType: "TRANSACTIONAL",
      isRedeemed: false,
    });
  }

  if (freeDelivery100kDiscount) {
    vouchers.push({
      code: "FREESHIP100",
      discountId: freeDelivery100kDiscount.id,
      voucherType: "FREEDELIVERY",
      isRedeemed: false,
    });
  }

  for (const voucher of vouchers) {
    await prisma.voucher.create({
      data: voucher,
    });
  }

  console.log(`✅ Created ${vouchers.length} vouchers`);
}
