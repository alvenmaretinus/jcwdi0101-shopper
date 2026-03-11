/**
 * EXAMPLE: Refactored Products Page using Zustand
 * 
 * This demonstrates how the admin products page can be dramatically simplified
 * by using centralized Zustand stores instead of managing state locally.
 * 
 * Before: ~200 lines with mixed concerns
 * After: ~80 lines, focused only on UI composition
 */

'use client'

import { useEffect } from 'react';
import { authClient } from '@/lib/authClient';
import { useAuthStore, useAdminProductsStore } from '@/store/admin';
import ProductForm from './_components/_product-form/product-form';
import ProductsCard from './_components/_products-card/products-card';
import { Pagination } from '@/components/Pagination/Pagination';

export default function ProductsRefactored() {
  const { data } = authClient.useSession();
  const user = data?.user;

  // Auth store - handles user role checking
  const { isSuperAdmin, fetchUserRole } = useAuthStore();

  // Products store - handles all product-related state and actions
  const {
    products,
    categories,
    loading,
    isDialogOpen,
    editingProduct,
    searchQuery,
    categoryFilter,
    currentPage,
    pagination,
    fetchProducts,
    fetchCategories,
    setSearchQuery,
    setCategoryFilter,
    setCurrentPage,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    deleteProduct,
  } = useAdminProductsStore();

  // Fetch user role on mount
  useEffect(() => {
    if (user?.email) {
      fetchUserRole(user.email);
    }
  }, [user?.email, fetchUserRole]);

  // Fetch initial data
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Handle actions
  const handleEdit = (product: any) => {
    openEditDialog(product);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Manage product catalog' : 'View product catalog'}
          </p>
        </div>
        {isSuperAdmin && (
          <ProductForm
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={closeDialog}
            editingProduct={editingProduct}
            handleCreate={openCreateDialog}
            onCreated={fetchProducts}
            categories={categories}
          />
        )}
      </div>
      
      <ProductsCard 
        products={products}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
        isSuperAdmin={isSuperAdmin}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
      
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={setCurrentPage}
      />
    </div>
  );
}
