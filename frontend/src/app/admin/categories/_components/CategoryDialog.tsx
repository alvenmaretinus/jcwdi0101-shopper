'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

type Categories = {
  id: string;
  name: string;
  productCount?: number;
  createdAt?: string | number | null;
}

type CategoryDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: Categories | null;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  isSuperAdmin: boolean;
  onCreateClick: () => void;
}

export function CategoryDialog({
  isOpen,
  onOpenChange,
  editingCategory,
  categoryName,
  onCategoryNameChange,
  onSubmit,
  submitting,
  isSuperAdmin,
  onCreateClick,
}: CategoryDialogProps) {
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={onCreateClick}>
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
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="category">Category Name</Label>
            <Input 
              id="category" 
              placeholder="e.g., Fruits & Vegetables" 
              value={categoryName}
              onChange={(e) => onCategoryNameChange(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
