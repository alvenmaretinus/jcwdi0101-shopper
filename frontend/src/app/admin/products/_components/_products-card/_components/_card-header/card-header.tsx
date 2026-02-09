import { CardHeader } from "@/components/ui/card";
import ProductsSearch from "./_components/product-search";
import ProductCategorySelect from "./_components/product-category-select";

export default function ProductCardHeader(props: any) {
    return (
        <CardHeader>
          <div className="flex items-center gap-4">
            <ProductsSearch searchQuery={props.searchQuery} setSearchQuery={props.setSearchQuery} />
            <ProductCategorySelect categoryFilter={props.categoryFilter} setCategoryFilter={props.setCategoryFilter} categories={props.categories} />
          </div>
        </CardHeader>
    );
};