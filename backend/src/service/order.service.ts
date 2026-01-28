import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";
import { getDistance } from "geolib";
import type { PrismaClient, Prisma,Store } from "../../prisma/generated/client";

type StoreWithDistance = {
  store: Store;
  distanceKm: number;
};

export class OrderService {
  static async checkout(userId: string, addressId: string, paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY" = "BANK_TRANSFER") {
    const address = await prisma.userAddress.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      throw new BadRequestError("SHIPPING_ADDRESS_REQUIRED");
    }

    const cart = await CartRepository.findCartWithItemsAndProduct(userId);
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestError("Cart is empty.");
    }

    const items = cart.cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity }));

    const db: PrismaClient = prisma;

    const stores = await db.store.findMany();
    const storesWithDistance : StoreWithDistance[]  = stores
      .map((store) => ({
        store,
        distanceKm: getDistance({ latitude: Number(address.latitude), longitude: Number(address.longitude) }, { latitude: store.latitude, longitude: store.longitude }) / 1000,
      }))
      .filter((s) => s.distanceKm <= 5)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (storesWithDistance.length === 0) {
      throw new BadRequestError("No store within 5 km of the shipping address.");
    }

    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } }, include: { category: true } });
    type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;
    const productMap: Record<string, ProductWithCategory | undefined> = {};
    for (const p of products ) productMap[p.id] = p;

    const costPerKm = 1000;

    for (const candidate of storesWithDistance) {
      const store = candidate.store;

      let canFulfill = true;
      for (const it of items) {
        const ps = await db.productStore.findUnique({ where: { productId_storeId: { productId: it.productId, storeId: store.id } } });
        if (!ps || ps.quantity < it.quantity) {
          canFulfill = false;
          break;
        }
      }
      if (!canFulfill) continue;

      try {
        const distance = candidate.distanceKm;
        const shippingCost = Math.ceil(distance * costPerKm);

        const subtotal = items.reduce((s, it) => s + (productMap[it.productId]?.price ?? 0) * it.quantity, 0);
        const totalDiscount = 0;
        const grandTotal = subtotal + shippingCost - totalDiscount;

        const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
          for (const it of items) {
            const upd = await tx.productStore.updateMany({
              where: { productId: it.productId, storeId: store.id, quantity: { gte: it.quantity } },
              data: { quantity: { decrement: it.quantity } },
            });
            if (upd.count === 0) {
              throw new BadRequestError("Stock changed during checkout, cannot fulfill from this store.");
            }
          }

          const shippingAddressText = `${address.recipientName} - ${address.addressName} | ${address.latitude},${address.longitude} | ${address.postCode}`;

          const order = await tx.order.create({
            data: {
              subtotal,
              totalDiscount,
              shippingCost,
              grandTotal,
              status: "PROCESSING",
              paymentType: paymentType,
              shippingAddress: shippingAddressText,
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

          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

          return order;
        });

        return result;
      } catch (err) {
        if (err instanceof BadRequestError) continue;
        throw err;
      }
    }

    throw new BadRequestError("No store within 5 km can fulfill the entire order.");
  }
}
