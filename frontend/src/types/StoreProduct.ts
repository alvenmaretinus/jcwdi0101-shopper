export type StoreProduct = {
  quantity: number;
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  price: number;
  originalPrice?: number; // For discount display
  createAt: string;
  category: string;
  images: string[];
  weight?: number; // Weight in grams per piece (e.g., 800 for 800g/pcs)
};