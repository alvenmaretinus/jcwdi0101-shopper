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
    where: { name: "Buy 2 Get 1 Any Product" },
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
    where: { name: "Buy 3 Get 1 Any Product" },
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

  const vouchers: Array<{
    code: string;
    discountId: string;
    userId?: string;
    referralRole?: "REFERRER" | "REFEREE";
    voucherType: "REFERRAL" | "TRANSACTIONAL" | "FREEDELIVERY";
  }> = [
    {
      code: "FRESH30",
      discountId: freshProduceDiscount.id,
      voucherType: "TRANSACTIONAL",
    },
    {
      code: "DAIRY3",
      discountId: dairyDiscount.id,
      voucherType: "TRANSACTIONAL",
    },
    {
      code: "FREEDELIVERY",
      discountId: freeDeliveryDiscount.id,
      voucherType: "FREEDELIVERY",
    },
  ];

  // Add additional vouchers if discounts exist
  if (megaWeekendDiscount) {
    vouchers.push({
      code: "MEGAWEEKEND",
      discountId: megaWeekendDiscount.id,
      voucherType: "TRANSACTIONAL",
    });
  }

  if (fruitBasketDiscount) {
    vouchers.push({
      code: "FRUITBASKET",
      discountId: fruitBasketDiscount.id,
      voucherType: "TRANSACTIONAL",
    });
  }

  if (newCustomerDiscount) {
    vouchers.push({
      code: "WELCOME20",
      discountId: newCustomerDiscount.id,
      voucherType: "TRANSACTIONAL",
    });
  }

  if (snacksDiscount) {
    vouchers.push({
      code: "SNACKS3FOR1",
      discountId: snacksDiscount.id,
      voucherType: "TRANSACTIONAL",
    });
  }

  if (midWeekDiscount) {
    vouchers.push({
      code: "MIDWEEK35",
      discountId: midWeekDiscount.id,
      voucherType: "TRANSACTIONAL",
    });
  }

  if (freeDelivery100kDiscount) {
    vouchers.push({
      code: "FREESHIP100",
      discountId: freeDelivery100kDiscount.id,
      voucherType: "FREEDELIVERY",
    });
  }

  const ensureReferralDiscount = async (name: string, percentage: number, minimumPrice?: number) => {
    const existingDiscount = await prisma.discount.findFirst({
      where: {
        name,
        isVoucher: true,
        type: "PERCENTAGE",
        isTiedToProduct: false,
        isSoftDeleted: false,
      },
    });

    if (existingDiscount) return existingDiscount;

    return prisma.discount.create({
      data: {
        name,
        percentage,
        type: "PERCENTAGE",
        isVoucher: true,
        isWithMinimum: minimumPrice !== undefined,
        minimumPrice,
        isQuantityLimited: true,
        maxUses: 1,
        isTiedToProduct: false,
      },
    });
  };

  const [adminReferralDiscount, storeAdminReferralDiscount, userReferralDiscount] = await Promise.all([
    ensureReferralDiscount("Admin Referral Reward", 18, 100000),
    ensureReferralDiscount("Store Admin Referral Reward", 15, 75000),
    ensureReferralDiscount("User Referral Reward", 12, 50000),
  ]);

  const [adminUser, storeAdminUser, normalUser] = await Promise.all([
    prisma.user.findUnique({ where: { email: "admin@example.com" } }),
    prisma.user.findUnique({ where: { email: "storeadmin@example.com" } }),
    prisma.user.findUnique({ where: { email: "user@example.com" } }),
  ]);

  const userDiscountByEmail: Record<string, { id: string }> = {
    "admin@example.com": adminReferralDiscount,
    "storeadmin@example.com": storeAdminReferralDiscount,
    "user@example.com": userReferralDiscount,
  };

  const addReferralVoucherPair = async (referrer: { id: string; email: string }, referred: { id: string; email: string }) => {
    const referrerDiscount = userDiscountByEmail[referrer.email];
    const referredDiscount = userDiscountByEmail[referred.email];
    if (!referrerDiscount || !referredDiscount) return;

    const assigned = await prisma.user.updateMany({
      where: {
        id: referred.id,
        referredById: null,
      },
      data: {
        referredById: referrer.id,
      },
    });

    if (assigned.count !== 1) return;

    const pairToken = `${referrer.id.substring(0, 4).toUpperCase()}${referred.id.substring(0, 4).toUpperCase()}`;

    vouchers.push(
      {
        code: `REFR-${pairToken}-${Date.now().toString().slice(-6)}`,
        discountId: referrerDiscount.id,
        userId: referrer.id,
        referralRole: "REFERRER",
        voucherType: "REFERRAL",
      },
      {
        code: `REFE-${pairToken}-${Date.now().toString().slice(-6)}`,
        discountId: referredDiscount.id,
        userId: referred.id,
        referralRole: "REFEREE",
        voucherType: "REFERRAL",
      },
    );
  };

  if (adminUser && storeAdminUser && normalUser) {
    await addReferralVoucherPair(adminUser, storeAdminUser);
    await addReferralVoucherPair(storeAdminUser, normalUser);
    await addReferralVoucherPair(normalUser, adminUser);
  }

  for (const voucher of vouchers) {
    await prisma.voucher.create({
      data: voucher,
    });
  }

  console.log(`✅ Created ${vouchers.length} vouchers`);
}
