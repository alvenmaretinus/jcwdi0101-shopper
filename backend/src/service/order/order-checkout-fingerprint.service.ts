import type { PrismaClient } from "../../../prisma/generated/client";
import type {
  ActivePendingOrderSnapshot,
  CheckoutItem,
} from "./order.types";

export class CheckoutFingerprintService {
  static normalizeVoucherIdentifiers(voucherIds?: string[]): string[] {
    if (!voucherIds || voucherIds.length === 0) {
      return [];
    }

    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const voucherId of voucherIds) {
      const value = voucherId.trim();
      if (!value) continue;

      const key = value.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      normalized.push(value);
    }

    return normalized;
  }

  private static toItemKeyMap(items: CheckoutItem[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.productId, item.quantity);
    }
    return map;
  }

  private static areSameItems(lhs: CheckoutItem[], rhs: CheckoutItem[]): boolean {
    if (lhs.length !== rhs.length) return false;

    const lhsMap = this.toItemKeyMap(lhs);
    const rhsMap = this.toItemKeyMap(rhs);
    if (lhsMap.size !== rhsMap.size) return false;

    for (const [productId, quantity] of lhsMap.entries()) {
      if (rhsMap.get(productId) !== quantity) {
        return false;
      }
    }

    return true;
  }

  private static areSameVoucherIdentifiers(lhs: string[], rhs: string[]): boolean {
    if (lhs.length !== rhs.length) return false;

    const lhsSet = new Set(lhs.map((value) => value.trim().toLowerCase()));
    const rhsSet = new Set(rhs.map((value) => value.trim().toLowerCase()));
    if (lhsSet.size !== rhsSet.size) return false;

    for (const key of lhsSet.values()) {
      if (!rhsSet.has(key)) {
        return false;
      }
    }

    return true;
  }

  private static isSameCheckoutFingerprint(
    existingOrder: ActivePendingOrderSnapshot,
    addressId: string,
    cartItems: CheckoutItem[],
    voucherIdentifiers: string[],
  ): boolean {
    if (existingOrder.userAddressId !== addressId) {
      return false;
    }

    if (!this.areSameItems(existingOrder.orderItems, cartItems)) {
      return false;
    }

    return this.areSameVoucherIdentifiers(existingOrder.voucherCodes, voucherIdentifiers);
  }

  static async findReusablePendingOrder(
    db: PrismaClient,
    userId: string,
    addressId: string,
    cartItems: CheckoutItem[],
    voucherIdentifiers: string[],
  ) {
    const activePendingOrders = await db.order.findMany({
      where: {
        userId,
        status: {
          in: ["PAYMENT_PENDING", "PAYMENT_WAITING_CONFIRMATION"],
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });

    const duplicateOrder = activePendingOrders.find((order) => {
      const snapshot: ActivePendingOrderSnapshot = {
        id: order.id,
        userAddressId: order.userAddressId,
        voucherCodes: order.voucherCodes,
        orderItems: order.orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      return this.isSameCheckoutFingerprint(snapshot, addressId, cartItems, voucherIdentifiers);
    });

    return duplicateOrder ?? null;
  }
}
