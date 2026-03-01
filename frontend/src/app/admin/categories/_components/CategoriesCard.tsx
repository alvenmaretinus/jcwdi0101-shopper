'use client'

import { Card } from '@/components/ui/card';
import { CategoriesCardHeader } from './CategoriesCardHeader';
import { CategoriesCardBody } from './CategoriesCardBody';

type Categories = {
  id: string;
  name: string;
  productCount?: number;
  createdAt?: string | number | null;
}

type CategoriesCardProps = {
  categories: Categories[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (category: Categories) => void;
  onDelete: (category: Categories) => void;
  isSuperAdmin: boolean;
}

export function CategoriesCard({
  categories,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
  isSuperAdmin,
}: CategoriesCardProps) {
  return (
    <Card>
      <CategoriesCardHeader
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <CategoriesCardBody
        categories={categories}
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        onPageChange={onPageChange}
        onEdit={onEdit}
        onDelete={onDelete}
        isSuperAdmin={isSuperAdmin}
      />
    </Card>
  );
}
