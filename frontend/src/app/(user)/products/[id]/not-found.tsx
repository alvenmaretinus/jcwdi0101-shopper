import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Package, ArrowLeft } from "lucide-react";

export default function ProductNotFound() {
  return (
    <Layout>
      <div className="container-app py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <Package className="h-24 w-24 mx-auto text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <Button size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
