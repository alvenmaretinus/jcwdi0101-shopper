import { Layout } from "@/components/layout/Layout";
import { getProducts } from "@/services/product/getProducts";
import { getProductCategories } from "@/services/product/getProductCategories";
import { getProductCategoryById } from "@/services/product/getProductCategoryById";
import { headers } from "next/headers";
import { ProductsList } from "./_components/ProductsList";

const Products = async ({
  searchParams,
}: {
  searchParams: Promise<{ 
    categoryId?: string; 
    page?: string; 
    limit?: string; 
    search?: string;
    inStockOnly?: string;
    sort?: string;
  }>;
}) => {
  const nextHeaders = await headers();
  const params = await searchParams;
  const categoryId = params.categoryId;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? parseInt(params.limit, 10) : 20;
  const search = params.search;
  const inStockOnly = params.inStockOnly === 'true';
  const sort = params.sort || 'featured';
  
  const [productsResponse, categories, selectedCategory] = await Promise.all([
    getProducts({ 
      withStock: true, 
      categoryId, 
      page, 
      limit,
      name: search,
      inStockOnly,
    }, nextHeaders),
    getProductCategories(nextHeaders),
    categoryId ? getProductCategoryById(categoryId, nextHeaders) : Promise.resolve(null),
  ]);

  return (
    <Layout>
      <ProductsList
        initialProducts={productsResponse.data}
        categories={categories}
        selectedCategoryId={categoryId}
        selectedCategoryName={selectedCategory?.category}
        pagination={productsResponse.meta}
        initialSearch={search}
        initialInStockOnly={inStockOnly}
        initialSort={sort}
      />
    </Layout>
  );
};

export default Products;
