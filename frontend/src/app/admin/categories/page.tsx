'use client'

import { useState, useEffect } from 'react';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';
import { CategoryDialog } from './_components/CategoryDialog';
import { CategoriesCard } from './_components/CategoriesCard';

type Categories = {
  id: string;
  name: string;
  productCount?: number;
  createdAt?: string | number | null;
}

type CategoriesResponse = {
  data: Categories[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ITEMS_PER_PAGE = 10;

export default function Categories() {
  const { data } = authClient.useSession();
  const user = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categories | null>(null);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 1,
  });

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
    const fetchCategories = async () => {
      const apiInit: ApiInit = { method: HttpMethod.GET };
      try {
        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        if (searchQuery.trim()) {
          query.set('name', searchQuery.trim());
        }

        const data = await apiFetch<CategoriesResponse>(`/product-category?${query.toString()}`, apiInit);
        setCategories(Array.isArray(data?.data) ? data.data : []);
        setPaginationMeta(data?.meta ?? {
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 1,
        });
      } catch (err) {
        console.error('Failed to load categories', err);
        setCategories([]);
        setPaginationMeta({
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 1,
        });
      }
    };
    fetchCategories();
  }, [currentPage, searchQuery]);

  const safeCurrentPage = Math.min(paginationMeta.page, paginationMeta.totalPages);
  const totalPages = paginationMeta.totalPages;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleEdit = (category: Categories) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const refreshCategories = async () => {
    const apiInit: ApiInit = { method: HttpMethod.GET };
    const query = new URLSearchParams({
      page: currentPage.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    });
    if (searchQuery.trim()) {
      query.set('name', searchQuery.trim());
    }
    const data = await apiFetch<CategoriesResponse>(`/product-category?${query.toString()}`, apiInit);
    setCategories(Array.isArray(data?.data) ? data.data : []);
    setPaginationMeta(data?.meta ?? {
      page: 1,
      limit: ITEMS_PER_PAGE,
      total: 0,
      totalPages: 1,
    });
  }

  const handleDelete = async (category: Categories) => {
    await apiFetch(`/product-category/${category.id}`, { method: HttpMethod.DELETE });
    await refreshCategories();
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingCategory) {
        const body = { name: categoryName };
        const apiInit: ApiInit = { method: HttpMethod.PATCH, body };
        await apiFetch(`/product-category/${editingCategory.id}`, apiInit);
      } else {
        const body = { name: categoryName };
        const apiInit: ApiInit = { method: HttpMethod.POST, body };
        await apiFetch(`/product-category`, apiInit);
      }
      await refreshCategories();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Failed to save category', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Manage product categories' : 'View product categories'}
          </p>
        </div>
        <CategoryDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingCategory={editingCategory}
          categoryName={categoryName}
          onCategoryNameChange={setCategoryName}
          onSubmit={handleSubmit}
          submitting={submitting}
          isSuperAdmin={isSuperAdmin}
          onCreateClick={handleCreate}
        />
      </div>

      <CategoriesCard
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentPage={safeCurrentPage}
        totalPages={totalPages}
        total={paginationMeta.total}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isSuperAdmin={isSuperAdmin}
      />
    </div>
  );
}
