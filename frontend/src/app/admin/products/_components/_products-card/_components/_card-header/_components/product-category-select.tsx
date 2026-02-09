import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Category = { id: string; category: string };

interface Props {
  categories: Category[];
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
}


export default function ProductCategorySelect(props: Props) {
    return (
        <Select value={props.categoryFilter} onValueChange={props.setCategoryFilter}>
            <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {props.categories ? props.categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                {cat.category}
                </SelectItem>
            )): null}
            </SelectContent>
        </Select>
    );
}