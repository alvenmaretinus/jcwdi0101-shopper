import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class OrderService {
  /**
   * Checkout: resolve a single store within 5km that can fulfill the cart,
   * decrement stock transactionally, create order and clear cart.
   */
  static async checkout(userId: string, shippingAddress: { latitude: number; longitude: number; addressText: string }, paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY" = "BANK_TRANSFER") {
    const cart = await CartRepository.findCartWithItemsAndProduct(userId);
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestError("Cart is empty.");
    }

    // gather cart items
    const items = cart.cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity }));

    const db: any = prisma;
    // find candidate stores and distances
    const stores: any[] = await db.store.findMany();
    const storesWithDistance = stores
      .map((s: any) => ({ store: s, distanceKm: haversineDistanceKm(shippingAddress.latitude, shippingAddress.longitude, s.latitude, s.longitude) }))
      .filter((s: any) => s.distanceKm <= 5)
      .sort((a: any, b: any) => a.distanceKm - b.distanceKm);

    if (storesWithDistance.length === 0) {
      throw new BadRequestError("No store within 5 km of the shipping address.");
    }

    // prepare product info map for pricing and category
    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } }, include: { category: true } });
    const productMap: Record<string, any> = {};
    for (const p of products) productMap[p.id] = p;

    // Shipping cost per km configuration
    const sc = await db.shippingCost.findFirst();
    const costPerKm = sc?.costPerKilometer ?? 1000;

    // Try each candidate store (nearest first)
    for (const candidate of storesWithDistance) {
      const store = candidate.store;
      // quick pre-check: does store have enough stock for each item?
      let canFulfill = true;
      for (const it of items) {
        const ps = await db.productStore.findUnique({ where: { productId_storeId: { productId: it.productId, storeId: store.id } } });
        if (!ps || ps.quantity < it.quantity) {
          canFulfill = false;
          break;
        }
      }
      if (!canFulfill) continue;

      // Attempt transactional decrement + order creation
      try {
        const distance = candidate.distanceKm;
        const shippingCost = Math.ceil(distance * costPerKm);

        const subtotal = items.reduce((s, it) => s + (productMap[it.productId]?.price ?? 0) * it.quantity, 0);
        const totalDiscount = 0;
        const grandTotal = subtotal + shippingCost - totalDiscount;

        const result = await db.$transaction(async (tx: any) => {
          // decrement stock using updateMany to ensure quantity >= needed
          for (const it of items) {
            const upd = await tx.productStore.updateMany({
              where: { productId: it.productId, storeId: store.id, quantity: { gte: it.quantity } },
              data: { quantity: { decrement: it.quantity } },
            });
            if (upd.count === 0) {
              throw new BadRequestError("Stock changed during checkout, cannot fulfill from this store.");
            }
          }

          // create order and order items
          const order = await tx.order.create({
            data: {
              subtotal,
              totalDiscount,
              shippingCost,
              grandTotal,
              status: "PROCESSING",
              paymentType: paymentType,
              shippingAddress: shippingAddress.addressText,
              storeAddress: store.addressName,
              storeName: store.name,
              storeId: store.id,
              userId,
              orderItems: {
                create: items.map((it) => ({
                  quantity: it.quantity,
                  unitPrice: productMap[it.productId]?.price ?? 0,
                  productName: productMap[it.productId]?.name ?? "",
                  productCategory: productMap[it.productId]?.category?.category ?? "",
                  productId: it.productId,
                })),
              },
            },
          });

          // create product movements
          for (const it of items) {
            const p = productMap[it.productId];
            await tx.productMovement.create({
              data: {
                quantityChange: -it.quantity,
                productName: p?.name ?? "",
                productCategory: p?.category?.category ?? "",
                movementType: "SOLD",
                productId: it.productId,
              },
            });
          }

          // clear cart items
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

          return order;
        });

        return result; // successful checkout
      } catch (err) {
        // if transaction failed due to stock race, try next store
        if (err instanceof BadRequestError) continue;
        throw err;
      }
    }

    throw new BadRequestError("No store within 5 km can fulfill the entire order.");
  }
}
