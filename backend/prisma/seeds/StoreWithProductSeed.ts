import { prisma } from "../../src/lib/db/prisma";

const storeData = [
  {
    name: "Grand Mall Surabaya",
    description: "Serving the east with the best quality products.",
    phone: "031-555-0303",
    longitude: 112.7521,
    latitude: -7.2575,
    addressName: "Tunjungan Plaza Area, Surabaya",
    postCode: "60275",
    isDefault: false,
  },
  {
    name: "Cool Corner Bandung",
    description: "Fashion and tech mix in the Paris van Java.",
    phone: "022-555-0202",
    longitude: 107.6191,
    latitude: -6.9175,
    addressName: "Dago Street No. 42, Bandung",
    postCode: "40135",
    isDefault: false,
  },
  {
    name: "Tech Hub Jakarta",
    description: "Our flagship store in the heart of Jakarta.",
    phone: "021-555-0101",
    longitude: 106.8456,
    latitude: -6.2088,
    addressName: "Sudirman Central Business District, Jakarta",
    postCode: "12190",
    isDefault: true,
  },
];

export async function StoreWithProductSeed({
  withCleanup = false,
}: {
  withCleanup?: boolean;
}) {
  if (withCleanup) {
    console.log("Cleaning up existing data...");
    // Cleanup in reverse order of dependencies
    await prisma.productStore.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    await prisma.store.deleteMany();
    await prisma.productCategory.deleteMany();
  }

  console.log("Creating categories...");
  const category = await prisma.productCategory.upsert({
    where: { name: "General" },
    update: {},
    create: { name: "General" },
  });

  console.log("Creating stores...");

  console.log("Creating stores and products...");
  let totalProducts = 0;
  for (const s of storeData) {
    const store = await prisma.store.create({ data: s });

    // Create 4 unique products for each store
    for (let i = 1; i <= 4; i++) {
      await prisma.product.create({
        data: {
          name: `[${store.name}] Gadget ${i}`,
          description: `Premium gadget ${i} available at ${store.name}. High performance and sleek design guaranteed.`,
          price: 150000 * i,
          categoryId: category.id,
          productImages: {
            create: [
              {
                url: `https://picsum.photos/seed/${store.name.replace(/\s+/g, "")}${i}/600/400`,
              },
            ],
          },
          productStores: {
            create: {
              storeId: store.id,
              quantity: Math.floor(Math.random() * 50) + 20, // Stock between 20 and 70
            },
          },
        },
      });
      totalProducts++;
    }
  }

  console.log("Seed completed successfully!");
  console.log(`Created ${storeData.length} stores.`);
  console.log(`Created ${totalProducts} total products.`);
}
