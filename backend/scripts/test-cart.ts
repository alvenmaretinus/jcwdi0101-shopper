// Try loading .env if dotenv is available, otherwise rely on environment variables.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
} catch (e) {
  // dotenv not installed or no .env — continue and expect DATABASE_URL in environment
}

// generate uuids for creates when prisma schema requires explicit ids
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { randomUUID } = require("crypto");
import { prisma } from "../src/lib/db/prisma";
import { CartService } from "../src/service/cart.service";

async function main() {
  try {
    console.log("Starting cart test script...");

    // Upsert test user by email
    const userEmail = "test-cart@example.local";
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { id: randomUUID(), email: userEmail, name: "Test Cart User", emailVerified: true },
    });

    // Ensure a store exists (take first store or create one)
    let store = await prisma.store.findFirst();
    if (!store) {
      store = await prisma.store.create({
        data: {
          name: "Test Store",
          phone: "000",
          longitude: 0,
          latitude: 0,
          addressName: "Test Address",
          postCode: "123 Test St",
        },
      });
    }

    // Ensure a product exists
    let product = await prisma.product.findFirst({ where: { name: "Test Product" } });
    if (!product) {
      product = await prisma.product.create({
        data: {
          name: "Test Product",
          price: 1000,
          category: { create: { category: "Test Category" } },
        },
      });
    }

    // Ensure ProductStore entry exists for the selected store
    const prodStore = await prisma.productStore.upsert({
      where: { productId_storeId: { productId: product.id, storeId: store.id } },
      update: { quantity: 10 },
      create: { productId: product.id, storeId: store.id, quantity: 10 },
    });

    console.log("Test entities:", { user: user.id, store: store.id, product: product.id, prodStoreQty: prodStore.quantity });

    // Run CartService operations
    console.log("Adding product to cart...");
    const added = await CartService.addToCart(user.id, product.id, 1);
    console.log("Added:", added);

    console.log("Getting cart (with recommended store stock info)...");
    const cart = await CartService.getCart(user.id, store.id);
    console.log(JSON.stringify(cart, null, 2));

    console.log("Updating cart item quantity to 3...");
    const updated = await CartService.updateCartItemQuantity(user.id, product.id, 3);
    console.log("Updated:", updated);

    console.log("Deleting cart item...");
    await CartService.deleteCartItem(user.id, product.id);
    console.log("Deleted.");
  } catch (err) {
    console.error("Error in test script:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
