import { prisma } from "../../src/lib/db/prisma";

export async function seedStoresWithProducts() {
  console.log("Seeding stores with products...");

  // Get all products
  const allProducts = await prisma.product.findMany();
  
  if (allProducts.length === 0) {
    console.log("No products found. Please run seedProducts first.");
    return;
  }

  // Define stores
  const stores = [
    {
      name: "Main Store - Jakarta",
      description: "Our flagship store in the heart of Jakarta",
      phone: "+62 21 5551234",
      longitude: 106.8456,
      latitude: -6.2088,
      addressName: "Jl. Sudirman No. 123, Jakarta Pusat",
      postCode: "10220",
      isDefault: true,
    },
    {
      name: "Store - Surabaya",
      description: "East Java distribution center",
      phone: "+62 31 5555678",
      longitude: 112.7521,
      latitude: -7.2575,
      addressName: "Jl. Tunjungan No. 456, Surabaya",
      postCode: "60261",
      isDefault: false,
    },
    {
      name: "Store - Bandung",
      description: "West Java branch serving Bandung area",
      phone: "+62 22 5559012",
      longitude: 107.6191,
      latitude: -6.9175,
      addressName: "Jl. Braga No. 789, Bandung",
      postCode: "40111",
      isDefault: false,
    },
  ];

  // Create stores and link products
  for (const storeData of stores) {
    const existingStore = await prisma.store.findFirst({
      where: { name: storeData.name },
    });

    if (existingStore) {
      console.log(`Store already exists: ${storeData.name}`);
      continue;
    }

    const createdStore = await prisma.store.create({
      data: storeData,
    });

    console.log(`Created store: ${createdStore.name}`);

    // Distribute products across stores with varying quantities
    // Main store gets more stock, other stores get less
    const isMainStore = storeData.isDefault;
    
    for (const product of allProducts) {
      // Random quantity based on store type
      let quantity: number;
      
      if (isMainStore) {
        // Main store: 50-200 units
        quantity = Math.floor(Math.random() * 151) + 50;
      } else {
        // Other stores: 20-100 units
        quantity = Math.floor(Math.random() * 81) + 20;
      }

      // Some products might not be available in all stores (10% chance of not stocking)
      if (!isMainStore && Math.random() < 0.1) {
        continue;
      }

      await prisma.productStore.create({
        data: {
          productId: product.id,
          storeId: createdStore.id,
          quantity,
        },
      });
    }

    console.log(`Added ${isMainStore ? 'all' : 'most'} products to ${createdStore.name}`);
  }

  console.log("Stores with products seeding completed.");
}
