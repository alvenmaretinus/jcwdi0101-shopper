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


  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    const apiInit: ApiInit = {
      method: HttpMethod.GET,
    };
    const fetchCategories = async () => {
      try {
        const data = await apiFetch<any[]>(`/product-category`, apiInit);
        console.log('Fetched categories:', data);
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async () => {
    console.log('Fetching products with', { categoryFilter, searchQuery, currentPage });
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
      const filterQuery = filterStrings.length > 0 ? `?${filterStrings.join('&')}` : '';
      const data = await apiFetch<any[]>(`/product${filterQuery}`, apiInit);
      console.log('Fetched products:', data);
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

  // Fetch when user sets a non-empty search query
  useEffect(() => {
    if (searchQuery !== undefined && searchQuery.trim() !== '') {
      fetchProducts();
    }
  }, [searchQuery, fetchProducts]);

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const apiInit: ApiInit = { method: HttpMethod.DELETE };
      await apiFetch(`/product/${id}`, apiInit);
      // refresh list
      await fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
    }
  };

  const handleCreate = async () => {
    // If we have at least one category, create a minimal product on the server
    // so the dialog can open in "edit" mode for that product. Otherwise just open dialog.
    if (categories && categories.length > 0) {
      try {
        const body = {
          name: 'New Product',
          description: '',
          price: 0,
          categoryId: categories[0].id,
        };
        const apiInit: ApiInit = { method: HttpMethod.POST, body };
        const created = await apiFetch<any>(`/product`, apiInit);
        setEditingProduct(created);
        // refresh list and open dialog for editing
        await fetchProducts();
        setIsDialogOpen(true);
      } catch (err) {
        console.error('Failed to create product draft', err);
        // fallback to opening empty dialog
        setEditingProduct(null);
        setIsDialogOpen(true);
      }
    } else {
      setEditingProduct(null);
      setIsDialogOpen(true);
    }
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
          <ProductForm
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            editingProduct={editingProduct}
            handleCreate={handleCreate}
            onCreated={() => fetchProducts()}
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
        onPageChange={handlePageChange}
      />
    </div>
  );
}
