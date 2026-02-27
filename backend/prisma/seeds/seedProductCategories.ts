import { prisma } from "../../src/lib/db/prisma";

export async function seedProductCategories() {
  console.log("Seeding product categories...");

  const categories = [
    { name: "Tropical Fruits" },
    { name: "Citrus Fruits" },
    { name: "Berries" },
    { name: "Stone Fruits" },
    { name: "Exotic Fruits" },
    { name: "Melons" },
    { name: "Apples & Pears" },
    { name: "Dried Fruits" },
    { name: "Leafy Greens" },
    { name: "Root Vegetables" },
    { name: "Cruciferous Vegetables" },
    { name: "Herbs" },
    { name: "Alliums" },
    { name: "Legumes" },
    { name: "Mushrooms" },
    { name: "Nuts & Seeds" },
    { name: "Fresh Juices" },
    { name: "Salad Mixes" },
    { name: "Organic Produce" },
    { name: "Seasonal Picks" },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    console.log(`Created category: ${cat.name}`);
  }

  console.log("Product categories seeding completed.");
}
