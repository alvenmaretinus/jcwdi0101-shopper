'use client'

import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, FolderTree } from 'lucide-react';
import { format } from 'date-fns';
import { Pagination } from '@/components/Pagination/Pagination';

type Categories = {
  id: string;
  name: string;
  productCount?: number;
  createdAt?: string | number | null;
}

type CategoriesCardBodyProps = {
  categories: Categories[];
  currentPage: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (category: Categories) => void;
  onDelete: (category: Categories) => void;
  isSuperAdmin: boolean;
}

export function CategoriesCardBody({
  categories,
  currentPage,
  totalPages,
  total,
  onPageChange,
  onEdit,
  onDelete,
  isSuperAdmin,
}: CategoriesCardBodyProps) {
  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    productCount: cat.productCount ?? 0,
    createdAt: cat.createdAt ?? null,
  }));

  return (
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Created</TableHead>
            {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {categoriesWithCount.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{category.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {category.createdAt ? format(new Date(category.createdAt), 'MMM dd, yyyy') : '-'}
              </TableCell>
              {isSuperAdmin && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDelete(category)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Pagination
        page={currentPage}
        totalPages={totalPages}
        total={total}
        onChange={onPageChange}
      />
    </CardContent>
  );
}
