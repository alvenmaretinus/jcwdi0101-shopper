'use client'

import { Label } from "@/components/ui/label";
import CreateButton from "./_components/create-button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Header from "./_components/header";
import { useState, useEffect, useRef, useMemo } from "react";
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';
import { X, Upload, Loader2 } from 'lucide-react';
import Image from 'next/image';
import SelectionModal from "@/components/Dialog/SelectionModal";
import { getProductCategories } from "@/services/product/getProductCategories";

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

export default function ProductForm(props: {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingProduct?: EditingProduct | null;
  handleCreate?: () => void;
  onCreated?: () => void;
  categories: { id: string; name: string }[];
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string | number>('');
  const [weight, setWeight] = useState<string | number>('');
  const [categoryId, setCategoryId] = useState('');
  const [isCategorySelectionModalOpen, setIsCategorySelectionModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(props.editingProduct?.name ?? '');
    setDescription(props.editingProduct?.description ?? '');
    setPrice(props.editingProduct?.price ?? '');
    setWeight(props.editingProduct?.weight ?? '');
    setCategoryId(props.editingProduct?.categoryId ?? '');
    setExistingImages(props.editingProduct?.productImages ?? []);
    setSelectedFiles([]);
    setPreviewUrls([]);
    
    // Debug: Log product images
    if (props.editingProduct?.productImages) {
      console.log('Product images:', props.editingProduct.productImages);
    }
  }, [props.editingProduct, props.isDialogOpen]);

  const getImageUrl = (url?: string) => {
    if (!url) {
      console.log('No URL provided, using placeholder');
      return 'https://placehold.co/400x400?text=No+Image';
    }
    // If URL is already absolute (starts with http:// or https://), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log('Absolute URL:', url);
      return url;
    }
    // Otherwise, prepend API base URL for relative paths
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const fullUrl = `${apiBaseUrl}${url}`;
    console.log('Relative URL converted:', url, '->', fullUrl);
    return fullUrl;
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: File[] = [];
    const maxFiles = 5;
    const maxSize = 1 * 1024 * 1024; // 1MB

    // Check total files (existing + to be uploaded + new selected files)
    const totalFiles = existingImages.length + selectedFiles.length + files.length;
    if (totalFiles > maxFiles) {
      alert(`Cannot exceed ${maxFiles} images total`);
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        continue;
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large (max 1MB)`);
        continue;
      }
      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Create preview URLs for new files
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverRef.current) {
      dragOverRef.current.classList.add('bg-accent');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverRef.current) {
      dragOverRef.current.classList.remove('bg-accent');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragOverRef.current) {
      dragOverRef.current.classList.remove('bg-accent');
    }
    handleFileSelect(e.dataTransfer.files);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!props.editingProduct?.id) return;
    
    setDeletingImageId(imageId);
    try {
      const apiInit: ApiInit = { method: HttpMethod.DELETE };
      await apiFetch(`/product/${props.editingProduct.id}/images/${imageId}`, apiInit);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      console.error('Failed to delete image', err);
      alert('Failed to delete image');
    } finally {
      setDeletingImageId(null);
    }
  };

  const uploadNewImages = async (productId: string) => {
    if (selectedFiles.length === 0) return;

    setUploadingImages(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/product/${productId}/images`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to upload images');
      }

      const data = await res.json();
      setExistingImages(data.data.productImages || []);
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (err: any) {
      console.error('Failed to upload images', err);
      throw err;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        name,
        description,
        price: Number(price),
        weight: Number(weight),
        categoryId: categoryId || undefined,
      } as any;

      let productId: string;

      if (props.editingProduct && props.editingProduct.id) {
        // Update existing product
        const apiInit: ApiInit = { method: HttpMethod.PATCH, body };
        await apiFetch(`/product/${props.editingProduct.id}`, apiInit);
        productId = props.editingProduct.id;
      } else {
        // Create new product
        const apiInit: ApiInit = { method: HttpMethod.POST, body };
        const newProduct = await apiFetch<any>(`/product`, apiInit);
        productId = newProduct.id;
      }

      // Upload images if any are selected
      if (selectedFiles.length > 0) {
        await uploadNewImages(productId);
      }

      props.onCreated && props.onCreated();
      props.setIsDialogOpen(false);
    } catch (err) {
      console.error('Failed to save product', err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalImages = existingImages.length + selectedFiles.length;
  const selectedCategoryName = useMemo(() => {
    if (!categoryId) return 'Select category';
    return props.categories?.find((cat) => cat.id === categoryId)?.name || 'Select category';
  }, [categoryId, props.categories]);

  const handleCategorySelect = (category: { id: string; name: string } | null) => {
    setCategoryId(category?.id ?? '');
  };

  return (
    <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
      <CreateButton handleCreate={props.handleCreate ?? (() => props.setIsDialogOpen(true))} />
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <Header editingProduct={!!props.editingProduct} />
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Fresh Apples"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (Rp)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="25000"
                value={String(price)}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (grams)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="500"
                value={String(weight)}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start text-left font-normal"
              onClick={() => setIsCategorySelectionModalOpen(true)}
            >
              {selectedCategoryName}
            </Button>
          </div>

          <SelectionModal
            open={isCategorySelectionModalOpen}
            onOpenChange={setIsCategorySelectionModalOpen}
            onSelect={handleCategorySelect}
            selectedSelectionId={categoryId || undefined}
            title="Select Category"
            description="Search and select a category for this product"
            getType={getProductCategories}
          />

          {/* Product Images Section */}
          <div className="space-y-3">
            <Label>Product Images ({totalImages}/5)</Label>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Current Images</p>
                <div className="grid grid-cols-3 gap-3">
                  {existingImages.map(image => (
                    <div key={image.id} className="relative group">
                      <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={getImageUrl(image.url)}
                          alt="Product image"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        disabled={deletingImageId === image.id}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        {deletingImageId === image.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images to Upload */}
            {previewUrls.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">New Images to Upload</p>
                <div className="grid grid-cols-3 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden border-2 border-dashed border-green-500">
                        <Image
                          src={url}
                          alt={`Preview ${index}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Zone */}
            {totalImages < 5 && (
              <div
                ref={dragOverRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition-colors"
              >
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop images here, or click to select
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max {5 - totalImages} more {5 - totalImages === 1 ? 'image' : 'images'}, PNG or JPG up to 5MB each
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.currentTarget.files)}
              className="hidden"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => props.setIsDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {selectedFiles.length > 0 ? 'Saving & Uploading...' : 'Saving...'}
                </>
              ) : (
                <>
                  {props.editingProduct ? 'Save Changes' : 'Create Product'}
                  {selectedFiles.length > 0 && ' & Upload Images'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}