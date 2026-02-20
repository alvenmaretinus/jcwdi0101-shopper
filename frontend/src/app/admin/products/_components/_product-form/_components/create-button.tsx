import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export default function CreateButton(props: { handleCreate: () => void}) {
    return (
    <DialogTrigger asChild>
        <Button onClick={props.handleCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Add Product
        </Button>
    </DialogTrigger>
    );  
}