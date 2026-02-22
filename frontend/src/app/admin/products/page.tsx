'use client'

import { useState, useEffect, useCallback } from 'react';
import ProductForm from './_components/_product-form/product-form';
import ProductsCard from './_components/_products-card/products-card';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { Pagination } from '@/components/Pagination/Pagination';

export default function Products() {
  const { data } = authClient.useSession();
  const user = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const userData = await getUserByEmail(user.email);
        if (userData?.role === 'SUPERADMIN') {
          setIsSuperAdmin(true);
        } 
      }
    };
    fetchUserRole();
  }, [user]);

  useEffect(() => {
    const apiInit: ApiInit = {
      method: HttpMethod.GET,
    };
    const fetchCategories = async () => {
      try {
        const data = await apiFetch<any>(`/product-category?page=1&limit=100`, apiInit);
        const categoriesArray = Array.isArray(data) ? data : data?.data || [];
        console.log('Fetched categories:', categoriesArray);
        setCategories(categoriesArray);
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
      const filterStrings = ['withStock=true', `page=${currentPage}`, 'limit=20']; // Include store information and pagination
      if (categoryFilter !== undefined && categoryFilter !== 'all') {
        filterStrings.push(`categoryId=${categoryFilter}`);
      }
      if (searchQuery !== undefined && searchQuery.trim() !== '') {
        filterStrings.push(`name=${searchQuery}`);
      }
      const filterQuery = filterStrings.length > 0 ? `?${filterStrings.join('&')}` : '';
      const response = await apiFetch<any>(`/product${filterQuery}`, apiInit);
      console.log('Fetched products:', response);
      // Check if response has data and meta properties (paginated response)
      if (response && 'data' in response && 'meta' in response) {
        setProducts(response.data);
        setPagination(response.meta);
      } else {
        // Fallback for non-paginated response
        setProducts(Array.isArray(response) ? response : []);
      }
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

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

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

  const handleCreate = () => {
    // Open dialog for creating a new product
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
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onChange={handlePageChange}
      />
    </div>
  );
}
