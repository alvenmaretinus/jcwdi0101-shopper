"use client";

import { ProductCard } from "@/components/products/ProductCard";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StoreProduct } from "@/types/StoreProduct";
import { getNearestProducts } from "@/services/store/getNearestProducts";

type Props = { initialProducts: StoreProduct[]; isDefaultAddress: boolean };

export const ProductGrid = ({ initialProducts, isDefaultAddress }: Props) => {
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);

  useEffect(() => {
    if (!isDefaultAddress) {
      const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
          toast.error("Geolocation is not supported by your browser");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const products = await getNearestProducts({
                limit: 20,
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                },
              });
              setProducts(products);
            } catch (error) {
              console.error("Failed to fetch stores with location:", error);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            let errorMessage = "Unable to get your location";
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Location permission denied. Sorting from default store.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Location information is unavailable. Please try again.";
                break;
              case error.TIMEOUT:
                errorMessage = "Location request timed out. Please try again.";
                break;
            }
            
            toast.error(errorMessage);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      };
      handleUseCurrentLocation();
    }
  }, [isDefaultAddress]);

  return (
    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
