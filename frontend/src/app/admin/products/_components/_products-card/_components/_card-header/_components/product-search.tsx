import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function ProductsSearch(props: any) {
    return (
           <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={props.searchQuery}
                onChange={(e) => props.setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
    );
}