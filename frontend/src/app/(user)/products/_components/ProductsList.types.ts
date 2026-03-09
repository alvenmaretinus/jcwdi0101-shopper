import { ProductWithDetails } from "@/services/product/getProducts";

export interface ProductCategory {
  id: string;
  name: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SelectedCategoryOption {
  id: string;
  name: string;
}

export interface ProductsGridProps {
  products: ProductWithDetails[];
}
