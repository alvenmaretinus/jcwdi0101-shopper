import { CardHeader } from "@/components/ui/card";
import SearchBar from "@/app/admin/_components/SearchBar";
import ProductCategorySelect from "./_components/product-category-select";

export default function ProductCardHeader(props: any) {
    return (
        <CardHeader>
          <div className="flex items-center gap-4">
            <SearchBar 
              value={props.searchQuery} 
              onChange={props.setSearchQuery}
              placeholder="Search products..."
            />
            <ProductCategorySelect categoryFilter={props.categoryFilter} setCategoryFilter={props.setCategoryFilter} categories={props.categories} />
          </div>
        </CardHeader>
    );
};