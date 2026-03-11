'use client'

import ProductForm from './_product-form/product-form';

interface ProductImage {
  id: string;
  url: string;
}

interface EditingProduct {
  id?: string;
  name?: string;
  description?: string;
  price?: number;
  weight?: number;
  categoryId?: string;
  productImages?: ProductImage[];
}

interface AdminProductsHeaderProps {
  isSuperAdmin: boolean;
  isDialogOpen: boolean;
  editingProduct: EditingProduct | null;
  categories: { id: string; name: string }[];
  openCreateDialog: () => void;
  closeDialog: () => void;
  fetchProducts: () => Promise<void>;
}

export default function AdminProductsHeader({
  isSuperAdmin,
  isDialogOpen,
  editingProduct,
  categories,
  openCreateDialog,
  closeDialog,
  fetchProducts,
}: AdminProductsHeaderProps) {
  return (
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
          setIsDialogOpen={(open) => {
            if (open) {
              openCreateDialog();
              return;
            }
            closeDialog();
          }}
          editingProduct={editingProduct}
          handleCreate={openCreateDialog}
          onCreated={fetchProducts}
          categories={categories}
        />
      )}
    </div>
  );
}