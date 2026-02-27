import { prisma } from "../../src/lib/db/prisma";

export async function seedProducts() {
  console.log("Seeding products...");

  // Get categories
  const tropical = await prisma.productCategory.findUnique({ where: { name: "Tropical Fruits" } });
  const citrus = await prisma.productCategory.findUnique({ where: { name: "Citrus Fruits" } });
  const berries = await prisma.productCategory.findUnique({ where: { name: "Berries" } });
  const stone = await prisma.productCategory.findUnique({ where: { name: "Stone Fruits" } });
  const exotic = await prisma.productCategory.findUnique({ where: { name: "Exotic Fruits" } });
  const melons = await prisma.productCategory.findUnique({ where: { name: "Melons" } });
  const apples = await prisma.productCategory.findUnique({ where: { name: "Apples & Pears" } });
  const dried = await prisma.productCategory.findUnique({ where: { name: "Dried Fruits" } });

  if (!tropical || !citrus || !berries || !stone || !exotic || !melons || !apples || !dried) {
    throw new Error("Categories not found. Please run seedProductCategories first.");
  }

  const products = [
    // Tropical Fruits
    {
      name: "Fresh Bananas (1kg)",
      description: "Sweet and creamy bananas, perfect for snacking or smoothies",
      price: 25000,
      categoryId: tropical.id,
      images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500"],
    },
    {
      name: "Ripe Pineapple",
      description: "Juicy golden pineapple, naturally sweet with tropical flavor",
      price: 35000,
      categoryId: tropical.id,
      images: ["https://images.unsplash.com/photo-1587735243615-c03f25aaff93?w=500"],
    },
    {
      name: "Fresh Coconut",
      description: "Young coconut with refreshing water and tender meat",
      price: 20000,
      categoryId: tropical.id,
      images: ["https://images.unsplash.com/photo-1589476449924-67f0136c2a35?w=500"],
    },
    {
      name: "Premium Papaya",
      description: "Ripe papaya with sweet orange flesh, rich in vitamins",
      price: 30000,
      categoryId: tropical.id,
      images: ["https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=500"],
    },
    {
      name: "Mango Harum Manis (1kg)",
      description: "Indonesian sweet mango variety with aromatic fragrance",
      price: 45000,
      categoryId: tropical.id,
      images: ["https://images.unsplash.com/photo-1553279768-865429fa0078?w=500"],
    },
    {
      name: "Fresh Guava (500g)",
      description: "Crisp white guava with pink flesh, loaded with vitamin C",
      price: 18000,
      categoryId: tropical.id,
      images: ["https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=500"],
    },

    // Citrus Fruits
    {
      name: "Navel Oranges (1kg)",
      description: "Sweet seedless oranges perfect for fresh juice",
      price: 40000,
      categoryId: citrus.id,
      images: ["https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500"],
    },
    {
      name: "Fresh Mandarins (1kg)",
      description: "Easy-to-peel mandarins with sweet tangy flavor",
      price: 35000,
      categoryId: citrus.id,
      images: ["https://images.unsplash.com/photo-1557800636-894a64c1696f?w=500"],
    },
    {
      name: "Organic Lemons (500g)",
      description: "Juicy lemons ideal for cooking and beverages",
      price: 30000,
      categoryId: citrus.id,
      images: ["https://images.unsplash.com/photo-1590502593747-42a996133562?w=500"],
    },
    {
      name: "Fresh Limes (500g)",
      description: "Tangy limes perfect for cocktails and cooking",
      price: 25000,
      categoryId: citrus.id,
      images: ["https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=500"],
    },
    {
      name: "Ruby Red Grapefruit (1kg)",
      description: "Sweet-tart grapefruit with vibrant red flesh",
      price: 50000,
      categoryId: citrus.id,
      images: ["https://images.unsplash.com/photo-1609779725693-13b6c24d3685?w=500"],
    },
    {
      name: "Sweet Pomelo",
      description: "Large citrus fruit with mild sweet flavor and pink flesh",
      price: 45000,
      categoryId: citrus.id,
      images: ["https://images.unsplash.com/photo-1608684311747-fc8e1bc90e07?w=500"],
    },

    // Berries
    {
      name: "Fresh Strawberries (250g)",
      description: "Sweet red strawberries, perfect for desserts",
      price: 55000,
      categoryId: berries.id,
      images: ["https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500"],
    },
    {
      name: "Blueberries (125g)",
      description: "Antioxidant-rich blueberries with sweet flavor",
      price: 65000,
      categoryId: berries.id,
      images: ["https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500"],
    },
    {
      name: "Fresh Raspberries (125g)",
      description: "Delicate red raspberries with sweet-tart taste",
      price: 75000,
      categoryId: berries.id,
      images: ["https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?w=500"],
    },
    {
      name: "Blackberries (125g)",
      description: "Juicy blackberries packed with vitamins",
      price: 70000,
      categoryId: berries.id,
      images: ["https://images.unsplash.com/photo-1588167846327-e5d4e1c9b20c?w=500"],
    },
    {
      name: "Mixed Berry Pack (400g)",
      description: "Assorted fresh berries including strawberries, blueberries, and raspberries",
      price: 120000,
      categoryId: berries.id,
      images: ["https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=500"],
    },
    {
      name: "Fresh Cranberries (250g)",
      description: "Tart cranberries for cooking and baking",
      price: 60000,
      categoryId: berries.id,
      images: ["https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?w=500"],
    },

    // Stone Fruits
    {
      name: "Ripe Peaches (1kg)",
      description: "Juicy white peaches with delicate sweet flavor",
      price: 80000,
      categoryId: stone.id,
      images: ["https://images.unsplash.com/photo-1629828939308-f0e68d9d73b4?w=500"],
    },
    {
      name: "Fresh Nectarines (1kg)",
      description: "Smooth-skinned nectarines with honey-sweet taste",
      price: 75000,
      categoryId: stone.id,
      images: ["https://images.unsplash.com/photo-1600881260921-c0b0b21fa985?w=500"],
    },
    {
      name: "Juicy Plums (1kg)",
      description: "Sweet purple plums perfect for snacking",
      price: 65000,
      categoryId: stone.id,
      images: ["https://images.unsplash.com/photo-1501169149367-03c400715e47?w=500"],
    },
    {
      name: "Fresh Apricots (500g)",
      description: "Golden apricots with sweet-tart flavor",
      price: 70000,
      categoryId: stone.id,
      images: ["https://images.unsplash.com/photo-1605185437088-a52ea3db16f8?w=500"],
    },
    {
      name: "Sweet Cherries (250g)",
      description: "Premium dark cherries, sweet and juicy",
      price: 120000,
      categoryId: stone.id,
      images: ["https://images.unsplash.com/photo-1528821128474-27f1838e76a5?w=500"],
    },
    {
      name: "Lychees (500g)",
      description: "Exotic stone fruit with sweet floral flavor",
      price: 55000,
      categoryId: stone.id,
      images: ["https://images.unsplash.com/photo-1609103677007-e1f7854e5301?w=500"],
    },

    // Exotic Fruits
    {
      name: "Dragon Fruit (Red)",
      description: "Vibrant dragon fruit with sweet white flesh and tiny black seeds",
      price: 40000,
      categoryId: exotic.id,
      images: ["https://images.unsplash.com/photo-1527325678964-54921661f888?w=500"],
    },
    {
      name: "Fresh Passion Fruit (6 pcs)",
      description: "Tangy passion fruit with aromatic pulp",
      price: 35000,
      categoryId: exotic.id,
      images: ["https://images.unsplash.com/photo-1597897212146-ceeff88b7df9?w=500"],
    },
    {
      name: "Ripe Avocado (3 pcs)",
      description: "Creamy Hass avocados perfect for toast and salads",
      price: 55000,
      categoryId: exotic.id,
      images: ["https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500"],
    },
    {
      name: "Fresh Kiwi (1kg)",
      description: "Tangy green kiwi fruit rich in vitamin C",
      price: 60000,
      categoryId: exotic.id,
      images: ["https://images.unsplash.com/photo-1585059895524-72359e06133a?w=500"],
    },
    {
      name: "Star Fruit (500g)",
      description: "Crisp star-shaped fruit with sweet-tart taste",
      price: 30000,
      categoryId: exotic.id,
      images: ["https://images.unsplash.com/photo-1599398054066-846f28917f38?w=500"],
    },
    {
      name: "Fresh Figs (250g)",
      description: "Sweet figs with honey-like flavor",
      price: 90000,
      categoryId: exotic.id,
      images: ["https://images.unsplash.com/photo-1583483312310-9e777c829262?w=500"],
    },
    {
      name: "Rambutan (500g)",
      description: "Hairy red fruit with translucent sweet flesh",
      price: 25000,
      categoryId: exotic.id,
      images: ["https://images.unsplash.com/photo-1598558852263-ec3c38c5551d?w=500"],
    },

    // Melons
    {
      name: "Sweet Watermelon (whole)",
      description: "Large seedless watermelon with crisp red flesh",
      price: 50000,
      categoryId: melons.id,
      images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500"],
    },
    {
      name: "Cantaloupe Melon",
      description: "Sweet orange melon with aromatic flesh",
      price: 45000,
      categoryId: melons.id,
      images: ["https://images.unsplash.com/photo-1621583832071-8b16676e3b3b?w=500"],
    },
    {
      name: "Honeydew Melon",
      description: "Pale green melon with sweet juicy flesh",
      price: 42000,
      categoryId: melons.id,
      images: ["https://images.unsplash.com/photo-1571575145641-c8bf63e39de6?w=500"],
    },
    {
      name: "Golden Melon",
      description: "Yellow melon with crisp sweet taste",
      price: 40000,
      categoryId: melons.id,
      images: ["https://images.unsplash.com/photo-1580158508060-87d168b1a3ba?w=500"],
    },
    {
      name: "Mini Watermelon (2kg)",
      description: "Personal sized watermelon with sweet red flesh",
      price: 30000,
      categoryId: melons.id,
      images: ["https://images.unsplash.com/photo-1621583864044-d445e8c1283d?w=500"],
    },

    // Apples & Pears
    {
      name: "Fuji Apples (1kg)",
      description: "Crisp sweet apples with dense flesh",
      price: 70000,
      categoryId: apples.id,
      images: ["https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=500"],
    },
    {
      name: "Granny Smith Apples (1kg)",
      description: "Tart green apples perfect for baking",
      price: 65000,
      categoryId: apples.id,
      images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500"],
    },
    {
      name: "Red Delicious Apples (1kg)",
      description: "Classic red apples with sweet mild flavor",
      price: 60000,
      categoryId: apples.id,
      images: ["https://images.unsplash.com/photo-1619546952812-c0c9c1b0f7f7?w=500"],
    },
    {
      name: "Fresh Pears (1kg)",
      description: "Juicy pears with buttery texture",
      price: 75000,
      categoryId: apples.id,
      images: ["https://images.unsplash.com/photo-1568297999810-95306f711d5f?w=500"],
    },
    {
      name: "Asian Pears (1kg)",
      description: "Crisp round pears with apple-like texture",
      price: 85000,
      categoryId: apples.id,
      images: ["https://images.unsplash.com/photo-1589992503564-c91e83e5be7e?w=500"],
    },
    {
      name: "Honeycrisp Apples (1kg)",
      description: "Premium crisp apples with honey-sweet flavor",
      price: 95000,
      categoryId: apples.id,
      images: ["https://images.unsplash.com/photo-1569870499705-504209102861?w=500"],
    },

    // Dried Fruits
    {
      name: "Dried Mango Slices (250g)",
      description: "Sweet dried mango without added sugar",
      price: 45000,
      categoryId: dried.id,
      images: ["https://images.unsplash.com/photo-1612169403993-bda08cc5e887?w=500"],
    },
    {
      name: "Dried Dates (500g)",
      description: "Natural sweet dates rich in fiber",
      price: 60000,
      categoryId: dried.id,
      images: ["https://images.unsplash.com/photo-1577069861033-55d04cec4ef5?w=500"],
    },
    {
      name: "Dried Apricots (250g)",
      description: "Tangy dried apricots packed with nutrients",
      price: 50000,
      categoryId: dried.id,
      images: ["https://images.unsplash.com/photo-1605185437088-a52ea3db16f8?w=500"],
    },
    {
      name: "Raisins Mix (500g)",
      description: "Assorted golden and dark raisins",
      price: 40000,
      categoryId: dried.id,
      images: ["https://images.unsplash.com/photo-1587241321921-91ffe01a8450?w=500"],
    },
    {
      name: "Dried Cranberries (250g)",
      description: "Sweetened dried cranberries for snacking",
      price: 55000,
      categoryId: dried.id,
      images: ["https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?w=500"],
    },
    {
      name: "Trail Mix Dried Fruits (400g)",
      description: "Mixed dried fruits including pineapple, papaya, and banana",
      price: 75000,
      categoryId: dried.id,
      images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500"],
    },
  ];

  for (const product of products) {
    const { images, ...productData } = product;
    
    const existingProduct = await prisma.product.findFirst({
      where: { name: productData.name },
      include: { productImages: true },
    });

    if (existingProduct) {
      console.log(`Product already exists: ${productData.name}`);
      
      // Check if images exist, if not, create them
      if (existingProduct.productImages.length === 0) {
        console.log(`Adding images for: ${productData.name}`);
        for (const imageUrl of images) {
          await prisma.productImage.create({
            data: {
              url: imageUrl,
              productId: existingProduct.id,
            },
          });
        }
      }
      continue;
    }

    const createdProduct = await prisma.product.create({
      data: productData,
    });

    // Create product images
    for (const imageUrl of images) {
      await prisma.productImage.create({
        data: {
          url: imageUrl,
          productId: createdProduct.id,
        },
      });
    }

    console.log(`Created product: ${createdProduct.name}`);
  }

  console.log("Products seeding completed.");
}
