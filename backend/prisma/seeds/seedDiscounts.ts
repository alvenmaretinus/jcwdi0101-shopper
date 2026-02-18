import { prisma } from "../../src/lib/db/prisma";

export async function seedDiscounts() {
  console.log("🎯 Seeding discounts...");

  // Clear existing vouchers first (due to foreign key constraint)
  await prisma.voucher.deleteMany();
  // Then clear existing discounts
  await prisma.discount.deleteMany();

  const now = new Date();
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const sixHoursLater = new Date(now.getTime() + 6 * 60 * 60 * 1000);

  // Get some products for product-specific discounts
  const products = await prisma.product.findMany({
    take: 8,
    where: {
      isSoftDeleted: false,
    },
  });

  const discounts = [
    // Voucher-based discounts
    {
      id: "discount-fresh-produce-30",
      name: "Weekend Fresh Produce",
      percentage: 30,
      type: "PERCENTAGE",
      isVoucher: true,
      isWithMinimum: false,
      isTiedToProduct: false,
      startsAt: now,
      endsAt: twoDaysLater,
    },
    {
      id: "discount-dairy-b2g1",
      name: "Dairy Delights Buy 2 Get 1",
      type: "QUANTITY",
      isVoucher: true,
      isWithMinimum: false,
      isTiedToProduct: false,
      buyQuantity: 2,
      freeQuantity: 1,
      startsAt: now,
      endsAt: fiveDaysLater,
    },
    {
      id: "discount-free-delivery",
      name: "Free Delivery on Orders Above 150k",
      amount: 0,
      type: "FIXED_AMOUNT",
      isVoucher: true,
      isWithMinimum: true,
      minimumPrice: 150000,
      isTiedToProduct: false,
      startsAt: now,
      endsAt: thirtyDaysLater,
    },
  ];

  // Add product-specific flash deals
  if (products.length >= 4) {
    discounts.push(
      {
        id: "discount-flash-product-1",
        name: "Flash Deal 22% Off",
        percentage: 22,
        type: "PERCENTAGE",
        isVoucher: false,
        isWithMinimum: false,
        isTiedToProduct: true,
        productId: products[0].id,
        startsAt: now,
        endsAt: sixHoursLater,
      },
      {
        id: "discount-flash-product-2",
        name: "Flash Deal 17% Off",
        percentage: 17,
        type: "PERCENTAGE",
        isVoucher: false,
        isWithMinimum: false,
        isTiedToProduct: true,
        productId: products[1].id,
        startsAt: now,
        endsAt: sixHoursLater,
      },
      {
        id: "discount-flash-product-3",
        name: "Flash Deal 21% Off",
        percentage: 21,
        type: "PERCENTAGE",
        isVoucher: false,
        isWithMinimum: false,
        isTiedToProduct: true,
        productId: products[2].id,
        startsAt: now,
        endsAt: sixHoursLater,
      },
      {
        id: "discount-flash-product-4",
        name: "Flash Deal 21% Off",
        percentage: 21,
        type: "PERCENTAGE",
        isVoucher: false,
        isWithMinimum: false,
        isTiedToProduct: true,
        productId: products[3].id,
        startsAt: now,
        endsAt: sixHoursLater,
      }
    );
  }

  // Add BOGO products
  if (products.length >= 8) {
    discounts.push(
      {
        id: "discount-bogo-product-1",
        name: "Buy 1 Get 1 Free",
        type: "QUANTITY",
        isVoucher: false,
        isWithMinimum: false,
        isTiedToProduct: true,
        productId: products[4].id,
        buyQuantity: 1,
        freeQuantity: 1,
        startsAt: now,
        endsAt: fiveDaysLater,
      },
      {
        id: "discount-bogo-product-2",
        name: "Buy 1 Get 1 Free",
        type: "QUANTITY",
        isVoucher: false,
        isWithMinimum: false,
        isTiedToProduct: true,
        productId: products[5].id,
        buyQuantity: 1,
        freeQuantity: 1,
        startsAt: now,
        endsAt: fiveDaysLater,
      },
      {
        id: "discount-bogo-product-3",
        name: "Buy 1 Get 1 Free",
        type: "QUANTITY",
        isVoucher: false,
        isWithMinimum: false,
        isTiedToProduct: true,
        productId: products[6].id,
        buyQuantity: 1,
        freeQuantity: 1,
        startsAt: now,
        endsAt: fiveDaysLater,
      },
      {
        id: "discount-bogo-product-4",
        name: "Buy 1 Get 1 Free",
        type: "QUANTITY",
        isVoucher: false,
        isWithMinimum: false,
        isTiedToProduct: true,
        productId: products[7].id,
        buyQuantity: 1,
        freeQuantity: 1,
        startsAt: now,
        endsAt: fiveDaysLater,
      }
    );
  }

  for (const discount of discounts) {
    await prisma.discount.create({
      data: discount,
    });
  }

  console.log(`✅ Created ${discounts.length} discounts`);
}
