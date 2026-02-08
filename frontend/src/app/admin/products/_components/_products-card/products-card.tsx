import { Card } from "@/components/ui/card";
import ProductCardHeader from "./_components/_card-header/card-header";
import ProductCardContent from "./_components/_card-content/card-content";

export default function ProductsCard(props: any) {
    return (
    <Card>
        <ProductCardHeader {...props} />
        <ProductCardContent {...props} />
    </Card>
    );
}