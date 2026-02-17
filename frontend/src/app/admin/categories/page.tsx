'use client'

import { useState, useEffect } from 'react';
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Plus, Pencil, Trash2, Search, FolderTree } from 'lucide-react';
import { format } from 'date-fns';
import type { ProductCategory } from '@/types/admin';
import { authClient } from '@/lib/authClient';
import { getUserByEmail } from '@/services/user/getUserByEmail';

type Categories = {
  id: string;
  category: string;
  productCount?: number;
  createdAt?: string | number | null;
}


const mockCategories: Categories[] = []
const mockProducts = []

export default function Categories() {
  const { data } = authClient.useSession();
  const user = data?.user;
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [categories, setCategories] = useState<Categories[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
        const data = await apiFetch<Categories[]>(`/product-category`, apiInit);
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load categories', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const categoriesWithCount = categories.map(cat => ({
    ...cat,
    productCount: cat.productCount ?? 0,
    createdAt: cat.createdAt ?? null,
  }));

  const filteredCategories = categoriesWithCount.filter(cat =>
    cat.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setCategoryName(category.category);
    setIsDialogOpen(true);
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
        const body = { category: categoryName };
        const apiInit: ApiInit = { method: HttpMethod.PATCH, body };
        await apiFetch(`/product-category/${editingCategory.id}`, apiInit);
      } else {
        const body = { category: categoryName };
        const apiInit: ApiInit = { method: HttpMethod.POST, body };
        await apiFetch(`/product-category`, apiInit);
      }
      // refresh
      const apiInit2: ApiInit = { method: HttpMethod.GET };
      const data = await apiFetch<Categories[]>(`/product-category`, apiInit2);
      setCategories(Array.isArray(data) ? data : []);
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
        {isSuperAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                <DialogDescription>
                  {editingCategory ? 'Update category name' : 'Create a new product category'}
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="category">Category Name</Label>
                  <Input 
                    id="category" 
                    placeholder="e.g., Fruits & Vegetables" 
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {editingCategory ? 'Save Changes' : 'Create Category'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                {/*<TableHead>Products</TableHead>*/}
                <TableHead>Created</TableHead>
                {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{category.category}</span>
                    </div>
                  </TableCell>
                  {/*
                  <TableCell>
                    <span className="text-muted-foreground">{category.productCount} products</span>
                  </TableCell>
                  */}
                  <TableCell className="text-muted-foreground">
                    {category.createdAt ? format(new Date(category.createdAt), 'MMM dd, yyyy') : '-'}
                  </TableCell>
                  {isSuperAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
