"use client";

import { ProductCard } from "@/app/(user)/_components/ProductCard";
import { getDistance } from "geolib";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StoreWithProducts } from "@/types/Store";
import { StoreProduct } from "@/types/StoreProduct";

type Props = { inititalStores: StoreWithProducts[]; isDefaultAddress: boolean };

export const ProductGrid = ({ inititalStores, isDefaultAddress }: Props) => {
  const [storesWithProducts, setStoresWithProducts] = useState(inititalStores);

  const nearestProductIds = new Set<string>();
  const productMap = new Map<string, StoreProduct>();
  storesWithProducts.forEach((store) => {
    store.products.forEach((product) => {
      if (!nearestProductIds.has(product.id)) {
        nearestProductIds.add(product.id);
      }
      const existingProduct = productMap.get(product.id);
      if (!existingProduct) {
        productMap.set(product.id, product);
      } else {
        const currMaxStock = existingProduct.quantity;
        productMap.set(product.id, {
          ...existingProduct,
          quantity: Math.max(currMaxStock, product.quantity),
        });
      }
    });
  });
  const uniqueProducts = Array.from(nearestProductIds)
    .map((id) => {
      const product = productMap.get(id);
      if (!product) {
        return null;
      }
      return product;
    })
    .filter((product) => product !== null);

  useEffect(() => {
    if (!isDefaultAddress) {
      const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
          toast.error("Geolocation is not supported by your browser");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newSortedStores = [...storesWithProducts].sort(
              (storeA, storeB) => {
                const distanceA = getDistance(
                  {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  },
                  {
                    latitude: storeA.latitude,
                    longitude: storeA.longitude,
                  }
                );
                const distanceB = getDistance(
                  {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  },
                  {
                    latitude: storeB.latitude,
                    longitude: storeB.longitude,
                  }
                );
                return distanceA - distanceB;
              }
            );

            setStoresWithProducts(newSortedStores);
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
          { enableHighAccuracy: true }
        );
      };
      handleUseCurrentLocation();
    }
  }, [isDefaultAddress]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {uniqueProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
