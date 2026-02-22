export type StoreProduct = {
  quantity: number;
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  price: number; // Final/displayed price
  originalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
  createAt: string;
  category: string;
  images: string[];
  weight?: number; // Weight in grams per piece (e.g., 800 for 800g/pcs)
};
