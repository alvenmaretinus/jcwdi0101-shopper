import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductCategorySelect(props: any) {
    return (
        <Select value={props.categoryFilter} onValueChange={props.setCategoryFilter}>
            <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {props.mockCategories ? props.mockCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                {cat.category}
                </SelectItem>
            )): null}
            </SelectContent>
        </Select>
    );
}