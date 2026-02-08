import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Header(props: { editingProduct: boolean }) {
    return (
        <DialogHeader>
            <DialogTitle>{props.editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
                {props.editingProduct ? 'Update product details' : 'Create a new product'}
            </DialogDescription>
        </DialogHeader>
    );
}