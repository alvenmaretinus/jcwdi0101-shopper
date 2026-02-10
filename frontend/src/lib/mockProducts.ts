/**
 * Mock Products Data for Testing Cart & Checkout
 *
 * This is temporary mock data for testing Feature 3 (Shopping Cart & Checkout)
 * When Michael completes Feature 2 (Product Management), replace this with actual API
 *
 * TODO: Remove this file and use actual API endpoint once products API is ready
 */

export interface MockProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  quantity: number;
  unit: string;
  stock: number;
  isBuyOneGetOne?: boolean;
  description: string;
  category: string;
  weight?: number;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "prod-001",
    name: "Beras Premium 5kg",
    price: 75000,
    originalPrice: 85000,
    // image: "https://via.placeholder.com/300x300?text=Beras+Premium",
    quantity: 0,
    weight: 5,
    unit: "kg",
    stock: 50,
    description: "Beras premium berkualitas tinggi, cocok untuk sehari-hari",
    category: "Biji-bijian",
  },
  {
    id: "prod-002",
    name: "Minyak Goreng 2L",
    price: 45000,
    originalPrice: 52000,
    // image: "https://via.placeholder.com/300x300?text=Minyak+Goreng",
    quantity: 0,
    weight: 5,
    unit: "L",
    stock: 100,
    isBuyOneGetOne: true,
    description: "Minyak goreng murni tanpa bahan kimia berbahaya",
    category: "Minyak & Bumbu",
  },
  {
    id: "prod-003",
    name: "Telur Ayam 1kg (10 butir)",
    price: 35000,
    // image: "https://via.placeholder.com/300x300?text=Telur+Ayam",
    quantity: 0,
    weight: 10,
    unit: "kg",
    stock: 75,
    description: "Telur ayam segar dari peternakan terpercaya",
    category: "Protein",
  },
  {
    id: "prod-004",
    name: "Susu UHT 1L (Kemasan 6)",
    price: 95000,
    originalPrice: 110000,
    // image: "https://via.placeholder.com/300x300?text=Susu+UHT",
    quantity: 0,
    weight: 6,
    unit: "pack",
    stock: 120,
    description: "Susu UHT terbaik dengan kandungan protein tinggi",
    category: "Minuman",
  },
  {
    id: "prod-005",
    name: "Gula Pasir 1kg",
    price: 15000,
    // image: "https://via.placeholder.com/300x300?text=Gula+Pasir",
    quantity: 0,
    weight: 1,
    unit: "kg",
    stock: 200,
    description: "Gula pasir putih berkualitas premium",
    category: "Minyak & Bumbu",
  },
  {
    id: "prod-006",
    name: "Garam Halus 500g",
    price: 8000,
    // image: "https://via.placeholder.com/300x300?text=Garam+Halus",
    quantity: 0,
    weight: 1,
    unit: "g",
    stock: 300,
    description: "Garam halus beriodium untuk kesehatan",
    category: "Minyak & Bumbu",
  },
  {
    id: "prod-007",
    name: "Sayur Segar - Bayam 500g",
    price: 18000,
    // image: "https://via.placeholder.com/300x300?text=Bayam",
    quantity: 0,
    weight: 1,
    unit: "g",
    stock: 60,
    description: "Bayam segar organik langsung dari petani lokal",
    category: "Sayuran",
  },
  {
    id: "prod-008",
    name: "Bawang Merah 500g",
    price: 25000,
    // image: "https://via.placeholder.com/300x300?text=Bawang+Merah",
    quantity: 0,
    weight: 1,
    unit: "g",
    stock: 80,
    description: "Bawang merah segar berkualitas A",
    category: "Bumbu Segar",
  },
  {
    id: "prod-009",
    name: "Daging Ayam Fillet 500g",
    price: 65000,
    originalPrice: 75000,
    // image: "https://via.placeholder.com/300x300?text=Daging+Ayam",
    quantity: 0,
    weight: 1,
    unit: "g",
    stock: 40,
    description: "Daging ayam fillet premium tanpa lemak",
    category: "Daging",
  },
  {
    id: "prod-010",
    name: "Roti Tawar Putih 500g",
    price: 22000,
    // image: "https://via.placeholder.com/300x300?text=Roti+Tawar",
    quantity: 0,
    weight: 1,
    unit: "g",
    stock: 55,
    description: "Roti tawar lembut dan segar setiap hari",
    category: "Bakery",
  },
];

/**
 * Get mock product by ID
 */
export function getMockProductById(id: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}

/**
 * Get mock products by category
 */
export function getMockProductsByCategory(category: string): MockProduct[] {
  return MOCK_PRODUCTS.filter((p) => p.category === category);
}

/**
 * Get all categories from mock products
 */
export function getMockCategories(): string[] {
  return [...new Set(MOCK_PRODUCTS.map((p) => p.category))];
}
