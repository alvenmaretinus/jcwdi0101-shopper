import "dotenv/config";
import { prisma } from "../../src/lib/db/prisma";
import { DiscountType, VoucherType } from "../generated/enums";

async function seedVoucherAndCart() {

  // Ensure discount (voucher) exists
  const voucherName = "DEV-VOUCHER-20K";
  let discount = await prisma.discount.findFirst({ where: { name: voucherName } });
  if (!discount) {
    discount = await prisma.discount.create({
      data: {
        id: crypto.randomUUID(),
        name: voucherName,
        amount: 20000, // fixed amount discount (20k)
        type: DiscountType.FIXED_AMOUNT,
        isVoucher: true,
        isWithMinimum: false,
        startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  } else {
  }

  // Ensure Voucher row exists referencing the discount
  let voucher = await prisma.voucher.findFirst({ where: { discountId: discount.id } });
  if (!voucher) {
    voucher = await prisma.voucher.create({
      data: {
        id: crypto.randomUUID(),
        code: `DEV20K-${discount.id.slice(0, 8).toUpperCase()}`,
        discountId: discount.id,
        voucherType: VoucherType.TRANSACTIONAL,
      },
    });
  } else {
  }

  // Ensure user and cart
  const userEmail = "user@example.com";
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    console.error(`User ${userEmail} not found. Run seedAccounts first.`);
    process.exit(1);
  }

  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { id: crypto.randomUUID(), userId: user.id } });
  }

  // Find a Panjer product (created by seedDenpasarPanjer)
  const product = await prisma.product.findFirst({ where: { name: { contains: "[Store Denpasar Panjer]" } } });
  if (!product) {
    console.error("No Panjer product found. Ensure seedDenpasarPanjer has run.");
    process.exit(1);
  }

  // Add product to cart (or update quantity)
  const desiredQty = 2;
  const existingItem = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: product.id } });
  if (existingItem) {
    await prisma.cartItem.update({ where: { id: existingItem.id }, data: { quantity: desiredQty } });
  } else {
    await prisma.cartItem.create({ data: { id: crypto.randomUUID(), cartId: cart.id, productId: product.id, quantity: desiredQty } });
  }

}

seedVoucherAndCart()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
