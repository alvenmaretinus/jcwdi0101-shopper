import "dotenv/config";
import { prisma } from "../../src/lib/db/prisma";

async function seedCartForUser() {
  const userEmail = "user@example.com";
  console.log(`Seeding cart for ${userEmail}...`);

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    console.error(`User ${userEmail} not found. Run seedAccounts first.`);
    process.exit(1);
  }

  // Ensure cart exists
  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { id: crypto.randomUUID(), userId: user.id } });
    console.log("Created cart for user", user.email);
  }

  // Find products created for Denpasar Panjer
  const products = await prisma.product.findMany({ where: { name: { contains: "[Store Denpasar Panjer]" } } });
  if (!products || products.length === 0) {
    console.error("No Panjer products found. Ensure seedDenpasarPanjer has run.");
    process.exit(1);
  }

  // Desired quantity per product
  const desiredQty = 2;

  for (const product of products) {
    // Check existing cart item
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: product.id } });
    if (existing) {
      // update quantity to desiredQty
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: desiredQty } });
      console.log(`Updated cart item for product ${product.name} to qty ${desiredQty}`);
    } else {
      await prisma.cartItem.create({ data: { id: crypto.randomUUID(), cartId: cart.id, productId: product.id, quantity: desiredQty } });
      console.log(`Added product ${product.name} to cart (qty ${desiredQty})`);
    }
  }

  console.log("Cart seeding completed.");
}

seedCartForUser()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
