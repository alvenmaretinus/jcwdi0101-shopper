'use client'

import ProductsCard from './_products-card/products-card';

interface AdminProductsListProps {
  products: unknown[];
  loading: boolean;
  searchQuery: string;
  categoryFilter: string;
  categories: { id: string; name: string }[];
  isSuperAdmin: boolean;
  currentPage: number;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (categoryId: string) => void;
  setCurrentPage: (page: number) => void;
  openEditDialog: (product: unknown) => void;
  deleteProduct: (id: string) => Promise<void>;
}

export default function AdminProductsList({
  products,
  loading,
  searchQuery,
  categoryFilter,
  categories,
  isSuperAdmin,
  currentPage,
  setSearchQuery,
  setCategoryFilter,
  setCurrentPage,
  openEditDialog,
  deleteProduct,
}: AdminProductsListProps) {
  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  return (
    <ProductsCard
      products={products}
      loading={loading}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      categoryFilter={categoryFilter}
      setCategoryFilter={setCategoryFilter}
      categories={categories}
      isSuperAdmin={isSuperAdmin}
      handleEdit={openEditDialog}
      handleDelete={handleDelete}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    />
  );
}