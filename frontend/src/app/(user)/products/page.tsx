import { Layout } from "@/components/layout/Layout";
import { getProducts } from "@/services/product/getProducts";
import { getProductCategories } from "@/services/product/getProductCategories";
import { headers } from "next/headers";
import { ProductsList } from "./_components/ProductsList";

const Products = async ({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; page?: string; limit?: string }>;
}) => {
  const nextHeaders = await headers();
  const params = await searchParams;
  const categoryId = params.categoryId;
  const page = params.page ? parseInt(params.page, 10) : 1;
  const limit = params.limit ? parseInt(params.limit, 10) : 20;
  
  const [productsResponse, categories] = await Promise.all([
    getProducts({ withStock: true, categoryId, page, limit }, nextHeaders),
    getProductCategories(nextHeaders),
  ]);

  // Find selected category name
  const selectedCategory = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null;

  return (
    <Layout>
      <ProductsList
        initialProducts={productsResponse.data}
        categories={categories}
        selectedCategoryId={categoryId}
        selectedCategoryName={selectedCategory?.category}
        pagination={productsResponse.meta}
      />
    </Layout>
  );
};

export default Products;
