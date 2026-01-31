import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";
import { getDistance } from "geolib";
import { ShippingCostService } from "./shipping-cost.service";
import { GetShippingCostInput } from "../schema/shipping-cost/GetShippingCostSchema";
import type { PrismaClient, Prisma, Store } from "../../prisma/generated/client";

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
    const storesWithDistance: StoreWithDistance[] = stores
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
    for (const p of products) productMap[p.id] = p;

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
        console.info(`[OrderService] checkout attempt user=${userId} address=${addressId} candidateStore=${store.id} items=${JSON.stringify(items)}`);
        const distance = candidate.distanceKm;

        const subtotal = items.reduce((s, it) => s + (productMap[it.productId]?.price ?? 0) * it.quantity, 0);
        // Try external shipping cost service first; fall back to distance * costPerKm
        let shippingCost = 0;
        try {
          const scInput: GetShippingCostInput = {
            originPostCode: String(store.postCode ?? ""),
            destinationPostCode: String(address.postCode ?? ""),
            weight: 1,
            itemValue: subtotal,
          };
          const scData = await ShippingCostService.getShippingCost(scInput);
          // prefer first available regular shipping option
          const option = scData.calculate_reguler?.[0] ?? scData.calculate_instant?.[0] ?? scData.calculate_cargo?.[0];
          shippingCost = option?.shipping_cost_net ?? Math.ceil(distance * costPerKm);
        } catch (e) {
          shippingCost = Math.ceil(distance * costPerKm);
        }
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

          // audit inside transaction
          console.info(`[OrderService] order created (tx) id=${order.id} user=${userId} store=${store.id} subtotal=${subtotal} grandTotal=${grandTotal}`);

          return order;
        });

        return result;
      } catch (err) {
        if (err instanceof BadRequestError) {
          console.warn(`[OrderService] store ${store.id} cannot fulfill during transaction, trying next store`);
          continue;
        }
        throw err;
      }
    }

    console.error(`[OrderService] checkout failed user=${userId} address=${addressId} - no store can fulfill`);
    throw new BadRequestError("No store within 5 km can fulfill the entire order.");
  }

  // Create a pending order (called when user clicks Place Order)
  static async createPendingOrder(userId: string, addressId: string, paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY" = "BANK_TRANSFER") {
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
    const storesWithDistance: StoreWithDistance[] = stores
      .map((store) => ({
        store,
        distanceKm: getDistance({ latitude: Number(address.latitude), longitude: Number(address.longitude) }, { latitude: store.latitude, longitude: store.longitude }) / 1000,
      }))
      .filter((s) => s.distanceKm <= 5)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (storesWithDistance.length === 0) {
      throw new BadRequestError("No store within 5 km of the shipping address.");
    }

    // pick nearest store that has enough stock for all items
    let candidateStore = null as Store | null;
    for (const s of storesWithDistance) {
      const storeCandidate = s.store;
      let canFulfill = true;
      for (const it of items) {
        const ps = await db.productStore.findUnique({ where: { productId_storeId: { productId: it.productId, storeId: storeCandidate.id } } });
        if (!ps || ps.quantity < it.quantity) {
          canFulfill = false;
          break;
        }
      }
      if (canFulfill) {
        candidateStore = storeCandidate;
        break;
      }
    }

    if (!candidateStore) {
      throw new BadRequestError("No store within 5 km can fulfill the entire order.");
    }

    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } }, include: { category: true } });
    type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;
    const productMap: Record<string, ProductWithCategory | undefined> = {};
    for (const p of products as ProductWithCategory[]) productMap[p.id] = p;

    const subtotal = items.reduce((s, it) => s + (productMap[it.productId]?.price ?? 0) * it.quantity, 0);
    const costPerKm = 1000;
    const distanceKm = storesWithDistance[0].distanceKm;
    const shippingCost = Math.ceil(distanceKm * costPerKm);
    const totalDiscount = 0;
    const grandTotal = subtotal + shippingCost - totalDiscount;

    // create pending order snapshot; do NOT decrement stock here
    // Payment deadline: 1 hour for manual bank transfer (per brief: "sekitar 1 jam" to upload proof)
    const paymentDueHours = Number(process.env.PAYMENT_DUE_HOURS ?? 1);
    const paymentDueAt = new Date(Date.now() + paymentDueHours * 60 * 60 * 1000);
    const order = await db.order.create({
      data: {
        subtotal,
        totalDiscount,
        shippingCost,
        grandTotal,
        status: "PAYMENT_PENDING",
        paymentType,
        shippingAddress: `${address.recipientName} - ${address.addressName} | ${address.latitude},${address.longitude} | ${address.postCode}`,
        storeAddress: candidateStore.addressName,
        storeName: candidateStore.name,
        storeId: candidateStore.id,
        paymentDueAt,
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

    return order;
  }

  // Confirm payment (called by payment gateway webhook). This will attempt to decrement stock and finalize the order.
  static async confirmPayment(orderId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({ where: { id: orderId }, include: { orderItems: true, user: true } });
    if (!order) throw new BadRequestError("Order not found");
    if (order.status !== "PAYMENT_PENDING") {
      return order; // idempotent: already processed
    }

    const addressText = order.shippingAddress;
    // extract coords from shippingAddress if available (best-effort)
    // For simplicity, re-query user address by closest match - fallback to store in order

    // Build items from orderItems
    const items = order.orderItems.map((oi) => ({ productId: oi.productId, quantity: oi.quantity }));

    const userAddress = await db.userAddress.findFirst({ where: { userId: order.userId } });

    const stores = await db.store.findMany();
    const storesWithDistance: StoreWithDistance[] = stores
      .map((store) => ({
        store,
        distanceKm: getDistance({ latitude: Number(userAddress?.latitude ?? 0), longitude: Number(userAddress?.longitude ?? 0) }, { latitude: store.latitude, longitude: store.longitude }) / 1000,
      }))
      .filter((s) => s.distanceKm <= 5)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (storesWithDistance.length === 0) {
      await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      throw new BadRequestError("No store within 5 km can fulfill the entire order.");
    }

    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } }, include: { category: true } });
    type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;
    const productMap: Record<string, ProductWithCategory | undefined> = {};
    for (const p of products as ProductWithCategory[]) productMap[p.id] = p;

    const costPerKm = 1000;

    // Try candidate stores (nearest first)
    for (const candidate of storesWithDistance) {
      const store = candidate.store;

      // quick pre-check
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
        const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
          // decrement stock
          for (const it of items) {
            const upd = await tx.productStore.updateMany({ where: { productId: it.productId, storeId: store.id, quantity: { gte: it.quantity } }, data: { quantity: { decrement: it.quantity } } });
            if (upd.count === 0) throw new BadRequestError("Stock changed during confirmation");
          }

          // finalize order
          const updated = await tx.order.update({ where: { id: orderId }, data: { status: "PROCESSING", storeId: store.id } });

          // create product movements
          for (const it of items) {
            const p = productMap[it.productId];
            await tx.productMovement.create({ data: { quantityChange: -it.quantity, productName: p?.name ?? "", productCategory: p?.category?.category ?? "", movementType: "SOLD", productId: it.productId } });
          }

          // clear cart for user
          const userCart = await tx.cart.findUnique({ where: { userId: order.userId } });
          if (userCart) {
            await tx.cartItem.deleteMany({ where: { cartId: userCart.id } });
          }

          return updated;
        });

        return result;
      } catch (err) {
        if (err instanceof BadRequestError) continue;
        throw err;
      }
    }

    // could not fulfill from any store - mark for refund (user already paid)
    const refundReason = "No store within 5 km can fulfill the entire order after payment approval";
    await db.order.update({ 
      where: { id: orderId }, 
      data: { 
        status: "CANCELLED",
        refundRequired: true,
        refundReason,
        cancelledAt: new Date()
      } 
    });
    console.error(`[OrderService] Order ${orderId} marked for refund - ${refundReason}`);
    throw new BadRequestError(refundReason);
  }

  // Expire pending orders that are past paymentDueAt
  static async expirePendingOrders() {
    const now = new Date();
    const db: PrismaClient = prisma;

    const expiredOrders = await db.order.updateMany({
      where: {
        status: "PAYMENT_PENDING",
        paymentDueAt: { lt: now },
      },
      data: { status: "CANCELLED" },
    });

    if (expiredOrders.count > 0) {
      console.info(`[OrderService] expired ${expiredOrders.count} pending orders past paymentDueAt`);
    }

    return expiredOrders;
  }

  // Upload payment proof for bank transfer
  static async uploadPaymentProof(orderId: string, userId: string, proofPath: string) {
    const db: PrismaClient = prisma;

    // Verify order exists and belongs to user
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestError("Order not found");
    }
    if (order.userId !== userId) {
      throw new BadRequestError("Unauthorized - order does not belong to user");
    }

    // Order must be PAYMENT_PENDING
    if (order.status !== "PAYMENT_PENDING") {
      throw new BadRequestError(`Cannot upload proof for order with status ${order.status}`);
    }

    // Check if payment deadline has passed
    if (order.paymentDueAt && new Date() > order.paymentDueAt) {
      // Auto-expire the order if deadline passed
      await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      throw new BadRequestError("Payment deadline has passed. Order cancelled.");
    }

    // Update order with proof and change status
    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: proofPath,
        status: "PAYMENT_WAITING_CONFIRMATION",
      },
    });

    return updated;
  }

  // Reject payment proof (admin only)
  static async rejectPaymentProof(orderId: string, rejectionReason?: string) {
    const db: PrismaClient = prisma;

    // Verify order exists
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestError("Order not found");
    }

    // Order must be PAYMENT_WAITING_CONFIRMATION
    if (order.status !== "PAYMENT_WAITING_CONFIRMATION") {
      throw new BadRequestError(`Cannot reject proof for order with status ${order.status}. Order must be in PAYMENT_WAITING_CONFIRMATION status.`);
    }

    // Update order back to PAYMENT_PENDING (allow user to upload again)
    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: null,
        status: "PAYMENT_PENDING",
      },
    });

    console.info(`[OrderService] rejected payment proof for order ${orderId}. Reason: ${rejectionReason || "N/A"}`);

    return updated;
  }

  // Get bank account information for payment
  static async getBankInfo() {
    return {
      bankName: process.env.BANK_NAME || "Bank Transfer",
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || "xxxx-xxxx-xxxx",
      accountHolder: process.env.BANK_ACCOUNT_HOLDER || "PT. Shopper Indonesia",
      bankCode: process.env.BANK_CODE || "bca",
    };
  }

  // Get list of orders (for user: own orders, for admin: store/all orders)
  static async getOrders(userId: string, userRole: string, storeId?: string, page: number = 1, limit: number = 10, status?: string, sortBy: "createdAt" | "status" = "createdAt", sortOrder: "asc" | "desc" = "desc") {
    const db: PrismaClient = prisma;
    const skip = (page - 1) * limit;

    let where: any = {};

    // Users see only their own orders
    if (userRole === "USER") {
      where.userId = userId;
    } else if (userRole === "STORE_ADMIN") {
      // Store admin sees only their store's orders
      if (storeId) where.storeId = storeId;
    } else if (userRole === "SUPERADMIN") {
      // Super admin sees all orders (storeId optional filter)
      if (storeId) where.storeId = storeId;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    const total = await db.order.count({ where });
    const orders = await db.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        orderItems: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    return {
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get order detail by ID
  static async getOrderById(orderId: string, userId?: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    // Authorization: user can only see own order, admin can see any
    if (userId && order.userId !== userId) {
      throw new BadRequestError("Unauthorized - order does not belong to user");
    }

    return order;
  }

  // Cancel order (only before payment)
  static async cancelOrder(orderId: string, userId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.userId !== userId) {
      throw new BadRequestError("Unauthorized - order does not belong to user");
    }

    // Can only cancel PAYMENT_PENDING orders
    if (order.status !== "PAYMENT_PENDING") {
      throw new BadRequestError(`Cannot cancel order with status ${order.status}. Only PAYMENT_PENDING orders can be cancelled.`);
    }

    // Note: For PAYMENT_PENDING, stock was never decremented, so no need to refund
    const updated = await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return updated;
  }

  // Admin marks order as shipped
  static async shipOrder(orderId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.status !== "PROCESSING") {
      throw new BadRequestError(`Cannot ship order with status ${order.status}. Only PROCESSING orders can be shipped.`);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        shippedAt: new Date(),
      },
    });

    return updated;
  }

  // User confirms receipt (order delivered)
  static async confirmOrder(orderId: string, userId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.userId !== userId) {
      throw new BadRequestError("Unauthorized - order does not belong to user");
    }

    if (order.status !== "SHIPPED") {
      throw new BadRequestError(`Cannot confirm order with status ${order.status}. Only SHIPPED orders can be confirmed.`);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    return updated;
  }

  // Auto-confirm orders 2 x 24 hours (2 days) after shipping
  static async autoConfirmOrders() {
    const db: PrismaClient = prisma;
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const confirmedOrders = await db.order.updateMany({
      where: {
        status: "SHIPPED",
        shippedAt: { lt: twoDaysAgo },
      },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    if (confirmedOrders.count > 0) {
      console.info(`[OrderService] auto-confirmed ${confirmedOrders.count} orders past 2-day shipping window`);
    }

    return confirmedOrders;
  }

  // Create Midtrans charge for PAYMENT_GATEWAY orders
  static async createMidtransCharge(orderId: string) {
    const db: PrismaClient = prisma;
    const { MidtransService } = await import("./midtrans.service");

    // Get order details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, user: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.status !== "PAYMENT_PENDING") {
      throw new BadRequestError(`Order status must be PAYMENT_PENDING, current: ${order.status}`);
    }

    if (order.paymentType !== "PAYMENT_GATEWAY") {
      throw new BadRequestError("This order is not using payment gateway");
    }

    if (!order.user?.email || !order.user?.name) {
      throw new BadRequestError("User email and name are required");
    }

    // Prepare item details for Midtrans
    const itemDetails = order.orderItems.map((item) => ({
      id: item.productId,
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
    }));

    // Add shipping cost as item
    itemDetails.push({
      id: "shipping",
      name: "Shipping Cost",
      price: order.shippingCost,
      quantity: 1,
    });

    try {
      // Create Midtrans transaction
      const transaction = await MidtransService.createCharge(orderId, order.grandTotal, order.user.email, order.user.name, itemDetails);

      // Transaction created successfully (don't store in DB yet as field doesn't exist)
      // Store can track via order.id relationship or webhook reference
      console.info(`[OrderService] Midtrans charge created for order ${orderId}, transaction: ${transaction.transactionId}`);

      return transaction;
    } catch (error) {
      console.error(`[OrderService] Failed to create Midtrans charge for order ${orderId}:`, error);
      throw error;
    }
  }

  // Handle Midtrans webhook callback
  static async handleMidtransWebhook(webhookData: any) {
    const db: PrismaClient = prisma;
    const { MidtransService } = await import("./midtrans.service");

    try {
      // Process webhook data
      const processedData = await MidtransService.handleWebhook(webhookData);
      const { orderId, shouldConfirmPayment, orderStatus } = processedData;

      console.info(`[OrderService] Processing Midtrans webhook for order ${orderId}, status: ${orderStatus}`);

      // Get current order
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true, user: true },
      });

      if (!order) {
        console.warn(`[OrderService] Order ${orderId} not found for webhook`);
        return;
      }

      // Handle payment success (settlement/capture)
      if (shouldConfirmPayment) {
        // Call confirmPayment to decrement stock and move order to PROCESSING
        return await this.confirmPayment(orderId);
      }

      // Handle payment failure/cancellation
      if (orderStatus === "CANCELLED") {
        // Update order status to CANCELLED (no stock was decremented yet for PAYMENT_GATEWAY)
        await db.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });

        console.info(`[OrderService] Order ${orderId} marked as CANCELLED from Midtrans webhook`);
        return;
      }

      // For other statuses, just log
      console.info(`[OrderService] Order ${orderId} webhook processed, status: ${orderStatus}`);
    } catch (error) {
      console.error("[OrderService] Error handling Midtrans webhook:", error);
      throw error;
    }
  }
}
