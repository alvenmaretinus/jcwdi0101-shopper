import { useMemo } from "react";
import SelectionSelect from "@/app/admin/_components/SelectionSelect";
import { getProductCategories } from "@/services/product/getProductCategories";

type Category = { id: string; name: string };

interface Props {
  categories: Category[];
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
}

export default function ProductCategorySelect(props: Props) {
    const selectedCategoryName = useMemo(() => {
        if (props.categoryFilter === 'all') return 'All Categories';
        const selectedCategory = props.categories.find((category) => category.id === props.categoryFilter);
        return selectedCategory?.name ?? 'Select Category';
    }, [props.categories, props.categoryFilter]);

    const handleCategorySelect = (category: Category | null) => {
        if (category) {
            props.setCategoryFilter(category.id);
            return;
        }
        props.setCategoryFilter('all');
    };

    return (
        <SelectionSelect
            value={props.categoryFilter}
            onChange={handleCategorySelect}
            getType={getProductCategories}
            title="Select Category"
            description="Search and select a category to filter products"
            className="w-48"
            displayValue={selectedCategoryName}
            showLabel={false}
        />
    );
}