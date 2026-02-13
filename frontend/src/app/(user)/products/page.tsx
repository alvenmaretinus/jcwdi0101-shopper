import { Layout } from "@/components/layout/Layout";
import { getProducts } from "@/services/product/getProducts";
import { getProductCategories } from "@/services/product/getProductCategories";
import { headers } from "next/headers";
import { ProductsList } from "./_components/ProductsList";

const Products = async ({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) => {
  const nextHeaders = await headers();
  const params = await searchParams;
  const categoryId = params.categoryId;
  
  const [products, categories] = await Promise.all([
    getProducts({ withStock: true, categoryId }, nextHeaders),
    getProductCategories(nextHeaders),
  ]);

  // Find selected category name
  const selectedCategory = categoryId
    ? categories.find((c) => c.id === categoryId)
    : null;

  return (
    <Layout>
      <ProductsList
        initialProducts={products}
        categories={categories}
        selectedCategoryId={categoryId}
        selectedCategoryName={selectedCategory?.category}
      />
    </Layout>
  );
};

export default Products;
