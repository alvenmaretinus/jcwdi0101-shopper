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
};
    
