import { Label } from "@/components/ui/label";
import CreateButton from "./_components/create-button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Header from "./_components/header";


export default function ProductForm(props: { isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    editingProduct: any;
    handleCreate: () => void;
    categories: { id: string; category: string }[]; }) {
    return (
        <Dialog open={props.isDialogOpen} onOpenChange={props.setIsDialogOpen}>
            <CreateButton handleCreate={props.handleCreate} />
            <DialogContent className="sm:max-w-lg">
              <Header editingProduct={!!props.editingProduct} />
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" placeholder="Fresh Apples" defaultValue={props.editingProduct?.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Product description..." 
                    defaultValue={props.editingProduct?.description} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Rp)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="25000" 
                      defaultValue={props.editingProduct?.price} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select defaultValue={props.editingProduct?.categoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {props.categories ? props.categories.map ? props.categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.category}
                          </SelectItem>
                        )) : null : null}
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
                  <Button type="button" variant="outline" onClick={() => props.setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" onClick={() => props.setIsDialogOpen(false)}>
                    {props.editingProduct ? 'Save Changes' : 'Create Product'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
    );
}