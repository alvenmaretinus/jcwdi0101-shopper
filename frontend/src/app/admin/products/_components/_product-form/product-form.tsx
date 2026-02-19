import { Label } from "@/components/ui/label";
import CreateButton from "./_components/create-button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Header from "./_components/header";
import { useState, useEffect } from "react";
import { apiFetch, ApiInit, HttpMethod } from '@/lib/apiFetch';


export default function ProductForm(props: { isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  editingProduct?: { id?: string; name?: string; description?: string; price?: number; categoryId?: string } | null;
  handleCreate?: () => void; // opens the dialog (used by CreateButton)
  onCreated?: () => void; // called after successful creation to notify parent
  categories: { id: string; category: string }[]; }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<string | number>('');
    const [categoryId, setCategoryId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
      setName(props.editingProduct?.name ?? '');
      setDescription(props.editingProduct?.description ?? '');
      setPrice(props.editingProduct?.price ?? '');
      setCategoryId(props.editingProduct?.categoryId ?? '');
    }, [props.editingProduct, props.isDialogOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        const body = {
          name,
          description,
          price: Number(price),
          categoryId: categoryId || undefined,
        } as any;

        if (props.editingProduct && props.editingProduct.id) {
          const apiInit: ApiInit = { method: HttpMethod.PATCH, body };
          await apiFetch(`/product/${props.editingProduct.id}`, apiInit);
        } else {
          const apiInit: ApiInit = { method: HttpMethod.POST, body };
          await apiFetch(`/product`, apiInit);
        }

        // notify parent and close dialog
        props.onCreated && props.onCreated();
        props.setIsDialogOpen(false);
      } catch (err) {
        console.error('Failed to create product', err);
      } finally {
        setSubmitting(false);
      }
    };

    return (
        <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
            <CreateButton handleCreate={props.handleCreate ?? (() => props.setIsDialogOpen(true))} />
            <DialogContent className="sm:max-w-lg">
              <Header editingProduct={!!props.editingProduct} />
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" placeholder="Fresh Apples" value={name} onChange={(e) => setName(e.target.value)} />
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
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryId} onValueChange={(v) => setCategoryId(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {props.categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Product Images</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Drag and drop images here, or click to select
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5 images, PNG or JPG up to 5MB each
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => props.setIsDialogOpen(false)} disabled={submitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {props.editingProduct ? 'Save Changes' : 'Create Product'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    );
}