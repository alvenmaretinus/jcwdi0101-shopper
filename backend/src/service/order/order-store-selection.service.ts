import { getDistance } from "geolib";
import type { PrismaClient, Store } from "../../../prisma/generated/client";
import { StoreOrderCapacityService } from "../store-order-capacity.service";
import type { CheckoutItem, StoreWithDistance } from "./order.types";

export class OrderStoreSelectionService {
  static findNearbyStores(stores: Store[], lat: number, lon: number): StoreWithDistance[] {
    return stores
      .map((store) => {
        const sLat = Number(store.latitude);
        const sLon = Number(store.longitude);
        if (!Number.isFinite(sLat) || !Number.isFinite(sLon)) return null;
        const distanceKm =
          getDistance(
            { latitude: lat, longitude: lon },
            { latitude: sLat, longitude: sLon },
          ) / 1000;
        return { store, distanceKm } as StoreWithDistance;
      })
      .filter((s): s is StoreWithDistance => s !== null)
      .filter((s) => s.distanceKm <= 5)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  static async findFulfillableStore(
    db: PrismaClient,
    storesWithDistance: StoreWithDistance[],
    items: CheckoutItem[],
    activeOrderCountByStoreId: Map<string, number>,
    maxActiveOrdersPerStore: number,
  ): Promise<StoreWithDistance | null> {
    const productIds = items.map((item) => item.productId);

    for (const storeWithDistance of storesWithDistance) {
      const activeOrderCount = activeOrderCountByStoreId.get(storeWithDistance.store.id) ?? 0;
      if (!StoreOrderCapacityService.canAcceptNewOrder(activeOrderCount, maxActiveOrdersPerStore)) {
        continue;
      }

      const storeProducts = await db.productStore.findMany({
        where: {
          storeId: storeWithDistance.store.id,
          productId: { in: productIds },
        },
      });

      const storeProductMap: Record<string, { quantity: number }> = {};
      for (const storeProduct of storeProducts) {
        storeProductMap[storeProduct.productId] = storeProduct;
      }

      let canFulfill = true;
      for (const item of items) {
        const storeProduct = storeProductMap[item.productId];
        if (!storeProduct || storeProduct.quantity < item.quantity) {
          canFulfill = false;
          break;
        }
      }

      if (canFulfill) {
        return storeWithDistance;
      }
    }

    return null;
  }
}
