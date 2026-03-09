import { Layout } from "@/components/layout/Layout";
import { ProductsList } from "./_components/ProductsList";

const Products = async ({
  searchParams,
}: {
  searchParams: Promise<{ 
    categoryId?: string; 
    page?: string; 
    limit?: string; 
    categoryPage?: string;
    categoryLimit?: string;
    search?: string;
    inStockOnly?: string;
    sort?: string;
  }>;
}) => {
  const params = await searchParams;

  return (
    <Layout>
      <ProductsList
        searchParams={params}
      />
    </Layout>
  );
};

export default Products;
