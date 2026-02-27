import "dotenv/config";
import { prisma } from "../../src/lib/db/prisma";
import { UserRole } from "../generated/enums";

async function seedDenpasarPanjer() {
  console.log("Seeding Denpasar - Panjer store and products...");

  // Use idempotent upsert by unique name + postCode combination
  const storeName = "Store Denpasar Panjer";
  const postCode = "80234"; // default Panjer/Denpasar area postcode; adjust if needed
  const latitude = -8.6739;
  const longitude = 115.2195;

  const existing = await prisma.store.findFirst({ where: { name: storeName, postCode } });

  let store;
  if (existing) {
    console.log("Store already exists, skipping create:", existing.id);
    store = existing;
  } else {
    store = await prisma.store.create({
      data: {
        id: crypto.randomUUID(),
        name: storeName,
        description: "Local store in Panjer, Denpasar for development testing.",
        phone: "0361-555-000",
        longitude,
        latitude,
        addressName: "Panjer Area, Denpasar",
        postCode,
        isDefault: false,
        isSoftDeleted: false,
      },
    });
    console.log("Created store:", store.id);
  }

  // Ensure admin@example.com is assigned to this store (idempotent)
  try {
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@example.com" },
      update: {
        role: UserRole.ADMIN,
        storeId: store.id,
        emailVerified: true,
        employeeJoinedAt: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        name: "Admin",
        email: "admin@example.com",
        emailVerified: true,
        role: UserRole.ADMIN,
        storeId: store.id,
        employeeJoinedAt: new Date(),
      },
    });
    console.log("Ensured admin user assigned to store:", adminUser.email, adminUser.storeId);
  } catch (e) {
    console.error("Failed to assign admin to store:", e);
  }

  // Ensure category
  const category = await prisma.productCategory.upsert({
    where: { name: "PanjerTest" },
    update: {},
    create: { name: "PanjerTest" },
  });

  // Create 3 products and productStore entries (idempotent by name + storeId)
  const productsData = [
    { name: "Panjer Coffee Beans", price: 50000 },
    { name: "Panjer Coconut Oil", price: 35000 },
    { name: "Panjer Snack Pack", price: 25000 },
  ];

  for (const p of productsData) {
    const prodName = `[${store.name}] ${p.name}`;
    const prod = await prisma.product.findFirst({ where: { name: prodName } });
    let product;
    if (prod) {
      product = prod;
      console.log("Product exists, skipping:", product.id);
    } else {
      product = await prisma.product.create({
        data: {
          name: prodName,
          description: `${p.name} for Denpasar Panjer local testing.`,
          price: p.price,
          categoryId: category.id,
          productImages: { create: [{ url: `https://picsum.photos/seed/${encodeURIComponent(prodName)}/600/400` }] },
        },
      });
      console.log("Created product:", product.id);
    }

    // Ensure productStore entry with sufficient stock
    const existingPS = await prisma.productStore.findFirst({ where: { productId: product.id, storeId: store.id } });
    if (existingPS) {
      // update stock to ensure sufficient quantity for tests
      await prisma.productStore.update({ where: { id: existingPS.id }, data: { quantity: Math.max(existingPS.quantity ?? 0, 50) } });
      console.log("Updated productStore stock for", product.id);
    } else {
      await prisma.productStore.create({ data: { productId: product.id, storeId: store.id, quantity: 50 } });
      console.log("Created productStore for", product.id);
    }
  }

  console.log("Denpasar Panjer seed finished.");
}

export default seedDenpasarPanjer;
