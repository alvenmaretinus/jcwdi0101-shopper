'use client'

import { useState, useEffect, useCallback } from 'react';
import ProductForm from './_components/_product-form/product-form';
import ProductsCard from './_components/_products-card/products-card';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';

export default function Products() {
  const user  = { role: 'SUPERADMIN' }; // Replace with actual user context
  const isSuperAdmin = user?.role === 'SUPERADMIN';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const mockCategories = []; // Replace with actual categories

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const apiInit: ApiInit = {
        method: HttpMethod.GET,
      };
      let filterStrings = [];
      if (categoryFilter !== undefined && categoryFilter !== 'all') {
        filterStrings.push(`categoryId=${categoryFilter}`);
      }
      if (searchQuery !== undefined && searchQuery.trim() !== '') {
        filterStrings.push(`name=${searchQuery}`);
      }
      //filterStrings.push(`page=${currentPage}`);
      const filterQuery = filterStrings.length > 0 ? `?${filterStrings.join('&')}` : '';
      const data = await apiFetch<any[]>(`/products${filterQuery}`, apiInit);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, searchQuery, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          <ProductForm />
        )}
      </div>
      <ProductsCard 
        products={products}
        loading={loading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        mockCategories={mockCategories}
        isSuperAdmin={isSuperAdmin}
        handleEdit={handleEdit}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
