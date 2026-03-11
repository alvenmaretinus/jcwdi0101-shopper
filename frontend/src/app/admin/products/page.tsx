'use client'

import { useEffect } from 'react';
import { authClient } from '@/lib/authClient';
import { useAuthStore } from '@/store/useAuthStore';
import { useAdminProductsStore } from '@/store/admin/useAdminProductsStore';
import {
  AdminProductsHeader,
  AdminProductsList,
  AdminProductsPagination,
} from './_components';

export default function Products() {
  const { data } = authClient.useSession();
  const user = data?.user;

  const { isSuperAdmin, fetchUserRole } = useAuthStore();

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

  useEffect(() => {
    if (user?.email) {
      fetchUserRole(user.email);
    }
  }, [fetchUserRole, user?.email]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="space-y-6">
      <AdminProductsHeader
        isSuperAdmin={isSuperAdmin}
        isDialogOpen={isDialogOpen}
        editingProduct={editingProduct}
        categories={categories}
        openCreateDialog={openCreateDialog}
        closeDialog={closeDialog}
        fetchProducts={fetchProducts}
      />

      <AdminProductsList
        products={products}
        loading={loading}
        searchQuery={searchQuery}
        categoryFilter={categoryFilter}
        categories={categories}
        isSuperAdmin={isSuperAdmin}
        currentPage={currentPage}
        setSearchQuery={setSearchQuery}
        setCategoryFilter={setCategoryFilter}
        setCurrentPage={setCurrentPage}
        openEditDialog={openEditDialog}
        deleteProduct={deleteProduct}
      />

      <AdminProductsPagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={setCurrentPage}
      />
    </div>
  );
}
