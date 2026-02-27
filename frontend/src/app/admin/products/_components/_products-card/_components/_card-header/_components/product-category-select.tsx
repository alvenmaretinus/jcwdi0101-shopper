import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import SelectionModal from "@/components/Dialog/SelectionModal";
import { getProductCategories } from "@/services/product/getProductCategories";

type Category = { id: string; name: string };

interface Props {
  categories: Category[];
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
}


export default function ProductCategorySelect(props: Props) {
    const [isCategorySelectionModalOpen, setIsCategorySelectionModalOpen] = useState(false);

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
        <>
            <Button
                type="button"
                variant="outline"
                className="w-48 justify-start text-left font-normal"
                onClick={() => setIsCategorySelectionModalOpen(true)}
            >
                {selectedCategoryName}
            </Button>

            <SelectionModal
                open={isCategorySelectionModalOpen}
                getType={getProductCategories}
                onOpenChange={setIsCategorySelectionModalOpen}
                onSelect={handleCategorySelect}
                selectedSelectionId={props.categoryFilter === 'all' ? null : props.categoryFilter}
                title="Select Category"
                description="Search and select a category to filter products"
            />
        </>
    );
}