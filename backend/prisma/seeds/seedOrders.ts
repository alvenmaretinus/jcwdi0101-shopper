import { prisma } from "../../src/lib/db/prisma";

export async function seedOrders() {
  console.log("🧾 Seeding completed sample order...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  const user =
    (await prisma.user.findFirst({
      where: { email: "user@example.com" },
    })) ??
    (await prisma.user.findFirst({
      where: { role: "USER" },
    }));

  if (!user) {
    console.log("No user found. Please run seedAccounts first.");
    return;
  }

  const store = (await prisma.store.findFirst({ where: { isDefault: true } })) ?? (await prisma.store.findFirst());

  if (!store) {
    console.log("No store found. Please run seedStoresWithProducts first.");
    return;
  }

  const productStores = await prisma.productStore.findMany({
    where: {
      storeId: store.id,
      quantity: { gt: 0 },
      product: { isSoftDeleted: false },
    },
    include: { product: { include: { category: true } } },
    take: 2,
  });

  if (productStores.length === 0) {
    console.log("No stocked products found. Please run product/store seed first.");
    return;
  }

  const primary = productStores[0];
  const secondary = productStores[1] ?? productStores[0];

  const orderItemsData = [
    {
      product: primary.product,
      quantity: 2,
      unitPrice: primary.product.price,
    },
    {
      product: secondary.product,
      quantity: 1,
      unitPrice: secondary.product.price,
    },
  ];

  const subtotal = orderItemsData.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

  const voucher = await prisma.voucher.findFirst({
    where: { code: "FRESH30", isSoftDeleted: false },
    include: { discount: true },
  });

  const productDiscount = await prisma.discount.findFirst({
    where: {
      isVoucher: false,
      isSoftDeleted: false,
      isTiedToProduct: true,
      productId: { in: orderItemsData.map((item) => item.product.id) },
    },
  });

  let voucherDiscountValue = 0;
  if (voucher?.discount) {
    const discount = voucher.discount;
    const minimumSatisfied = !discount.isWithMinimum || (discount.minimumPrice != null && subtotal >= discount.minimumPrice);

    if (minimumSatisfied) {
      if (discount.type === "PERCENTAGE" && discount.percentage != null) {
        voucherDiscountValue = Math.floor(subtotal * (Number(discount.percentage) / 100));
      } else if (discount.type === "FIXED_AMOUNT" && discount.amount != null) {
        voucherDiscountValue = discount.amount;
      } else if (discount.type === "QUANTITY" && discount.buyQuantity != null && discount.freeQuantity != null) {
        const freeUnits = Math.floor(orderItemsData[0].quantity / discount.buyQuantity) * discount.freeQuantity;
        voucherDiscountValue = freeUnits * orderItemsData[0].unitPrice;
      }
    }
  }

  let productDiscountValue = 0;
  if (productDiscount) {
    const discountedItem = orderItemsData.find((item) => item.product.id === productDiscount.productId);

    if (discountedItem) {
      const itemTotal = discountedItem.unitPrice * discountedItem.quantity;
      if (productDiscount.type === "PERCENTAGE" && productDiscount.percentage != null) {
        productDiscountValue = Math.floor(itemTotal * (Number(productDiscount.percentage) / 100));
      } else if (productDiscount.type === "FIXED_AMOUNT" && productDiscount.amount != null) {
        productDiscountValue = productDiscount.amount;
      } else if (productDiscount.type === "QUANTITY" && productDiscount.buyQuantity != null && productDiscount.freeQuantity != null) {
        const freeUnits = Math.floor(discountedItem.quantity / productDiscount.buyQuantity) * productDiscount.freeQuantity;
        productDiscountValue = freeUnits * discountedItem.unitPrice;
      }
    }
  }

  const totalDiscount = Math.min(subtotal, voucherDiscountValue + productDiscountValue);
  const shippingCost = 10000;
  const grandTotal = subtotal - totalDiscount + shippingCost;

  const now = new Date();
  const paidAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const confirmedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const shippedAt = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const deliveredAt = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  const defaultAddress =
    (await prisma.userAddress.findFirst({
      where: { userId: user.id, isDefault: true },
    })) ??
    (await prisma.userAddress.create({
      data: {
        userId: user.id,
        addressType: "HOME",
        addressName: "Jl. Melati No. 10, Jakarta",
        recipientName: user.name ?? "Normal User",
        isDefault: true,
        longitude: 106.8456,
        latitude: -6.2088,
        postCode: "10220",
      },
    }));

  const createdOrder = await prisma.order.create({
    data: {
      subtotal,
      totalDiscount,
      shippingCost,
      grandTotal,
      status: "DELIVERED",
      paymentType: "BANK_TRANSFER",
      voucherCodes: voucher ? [voucher.code] : [],
      discountNames: [...(voucher?.discount?.name ? [voucher.discount.name] : []), ...(productDiscount?.name ? [productDiscount.name] : [])],
      paidAt,
      confirmedAt,
      shippedAt,
      deliveredAt,
      shippingAddress: defaultAddress.addressName,
      storeAddress: store.addressName,
      storeName: store.name,
      storeId: store.id,
      userId: user.id,
      userAddressId: defaultAddress.id,
      orderItems: {
        create: orderItemsData.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productName: item.product.name,
          productCategory: item.product.category.name,
          productId: item.product.id,
        })),
      },
    },
  });

  if (voucher) {
    // Redemption is tracked via discount.useCounter, increment it
    await prisma.discount.update({
      where: { id: voucher.discountId },
      data: {
        useCounter: { increment: 1 },
      },
    });
  }

  console.log(`✅ Created completed order ${createdOrder.id} with voucher and discount applied`);
}
