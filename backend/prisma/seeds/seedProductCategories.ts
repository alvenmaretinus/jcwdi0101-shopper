import { prisma } from "../../src/lib/db/prisma";

export async function seedProductCategories() {
  console.log("Seeding product categories...");

  const categories = [
    { category: "Tropical Fruits" },
    { category: "Citrus Fruits" },
    { category: "Berries" },
    { category: "Stone Fruits" },
    { category: "Exotic Fruits" },
    { category: "Melons" },
    { category: "Apples & Pears" },
    { category: "Dried Fruits" },
  ];

  for (const cat of categories) {
    await prisma.productCategory.upsert({
      where: { category: cat.category },
      update: {},
      create: cat,
    });
    console.log(`Created category: ${cat.category}`);
  }

  console.log("Product categories seeding completed.");
}
