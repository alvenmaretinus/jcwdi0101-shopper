import { prisma } from "../lib/db/prisma";
import type { PrismaClient } from "../../prisma/generated/client";
import { NotFoundError } from "../error/NotFoundError";
import { UnauthorizedError } from "../error/UnauthorizedError";
import { OrderVoucherReservationService } from "./order/order-voucher-reservation.service";

/**
 * OrderQueryService: Handles order retrieval and search operations
 * Responsibilities:
 * - List orders with filters, pagination, sorting
 * - Get order detail
 */
export class OrderQueryService {
  private static hasQuantityBonusTokenByPrefix(
    discountNames: string[] | null | undefined,
    prefix: string,
  ) {
    if (!Array.isArray(discountNames) || discountNames.length === 0) {
      return false;
    }

    return discountNames.some((name) => name.startsWith(prefix));
  }

  private static buildPromoQuantityBonusToken(
    orderItems: Array<{ productId: string; quantity: number }> | null | undefined,
    appliedDiscountIds: string[] | null | undefined,
    quantityDiscountMap: Map<
      string,
      { productId: string | null; buyQuantity: number; freeQuantity: number }
    >,
  ) {
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return null;
    }

    if (!Array.isArray(appliedDiscountIds) || appliedDiscountIds.length === 0) {
      return null;
    }

    const bonusLines: Array<{ productId: string; freeQuantity: number }> = [];

    for (const orderItem of orderItems) {
      let bestFreeQuantity = 0;

      for (const discountId of appliedDiscountIds) {
        const discount = quantityDiscountMap.get(discountId);
        if (!discount || !discount.productId || discount.productId !== orderItem.productId) {
          continue;
        }

        if (discount.buyQuantity <= 0 || discount.freeQuantity <= 0) {
          continue;
        }

        const freeQuantity =
          Math.floor(orderItem.quantity / discount.buyQuantity) *
          discount.freeQuantity;

        if (freeQuantity > bestFreeQuantity) {
          bestFreeQuantity = freeQuantity;
        }
      }

      if (bestFreeQuantity > 0) {
        bonusLines.push({
          productId: orderItem.productId,
          freeQuantity: bestFreeQuantity,
        });
      }
    }

    return OrderVoucherReservationService.serializeQuantityBonuses(
      "PROMO_QTY_BONUSES",
      bonusLines,
    );
  }

  private static buildVoucherQuantityBonusToken(
    orderItems: Array<{ productId: string; quantity: number }> | null | undefined,
    voucherCodes: string[] | null | undefined,
    quantityVoucherMap: Map<
      string,
      { productId: string | null; buyQuantity: number; freeQuantity: number }
    >,
  ) {
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return null;
    }

    if (!Array.isArray(voucherCodes) || voucherCodes.length === 0) {
      return null;
    }

    const bonusLines: Array<{ productId: string; freeQuantity: number }> = [];

    for (const orderItem of orderItems) {
      let bestFreeQuantity = 0;

      for (const voucherCodeRaw of voucherCodes) {
        const voucherCode = String(voucherCodeRaw ?? "").trim().toLowerCase();
        const voucherRule = quantityVoucherMap.get(voucherCode);
        if (!voucherRule) {
          continue;
        }

        if (
          voucherRule.productId &&
          voucherRule.productId !== orderItem.productId
        ) {
          continue;
        }

        if (voucherRule.buyQuantity <= 0 || voucherRule.freeQuantity <= 0) {
          continue;
        }

        const freeQuantity =
          Math.floor(orderItem.quantity / voucherRule.buyQuantity) *
          voucherRule.freeQuantity;

        if (freeQuantity > bestFreeQuantity) {
          bestFreeQuantity = freeQuantity;
        }
      }

      if (bestFreeQuantity > 0) {
        bonusLines.push({
          productId: orderItem.productId,
          freeQuantity: bestFreeQuantity,
        });
      }
    }

    return OrderVoucherReservationService.serializeQuantityBonuses(
      "VOUCHER_QTY_BONUSES",
      bonusLines,
    );
  }

  /**
   * Get orders with role-based filtering, pagination, and search
   * @param userId Current user ID
   * @param userRole User role for authorization (USER, ADMIN, SUPERADMIN)
   * @param storeId Store ID (for admin/superadmin filtering)
   * @param page Pagination page number (1-indexed)
   * @param limit Items per page
   * @param status Filter by order status
   * @param sortBy Sort field (createdAt or status)
   * @param sortOrder Sort direction (asc or desc)
   * @param dateFrom Start date for range filter (ISO format)
   * @param dateTo End date for range filter (ISO format)
   * @param search Search in order ID
   * @returns Paginated orders with pagination metadata
   * @note Role-based: USER sees own orders, ADMIN sees store orders, SUPERADMIN sees all
   */
  static async getOrders(
    userId: string,
    userRole: string,
    storeId?: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    sortBy: "createdAt" | "status" = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    dateFrom?: string,
    dateTo?: string,
    search?: string,
  ) {
    const db: PrismaClient = prisma;
    const skip = (page - 1) * limit;

    let where: any = {};

    // Authorization: Users see own, Admins see their store, SuperAdmins see all
    if (userRole === "USER") {
      where.userId = userId;
    } else if (userRole === "ADMIN") {
      if (!storeId) {
        throw new UnauthorizedError("ADMIN user must have a storeId assigned to view orders");
      }
      where.storeId = storeId;
    } else if (userRole === "SUPERADMIN") {
      if (storeId) where.storeId = storeId;
    }

    // Filter by status if provided
    if (status) {
      where.status = status;
    }

    // Filter by date range if provided
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Add 1 day to include entire end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        where.createdAt.lt = endDate;
      }
    }

    // Search by order ID if provided
    if (search) {
      where.id = {
        contains: search,
        mode: "insensitive",
      };
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

    const allAppliedDiscountIds = Array.from(
      new Set(
        orders.flatMap((order) =>
          Array.isArray(order.appliedDiscountIds) ? order.appliedDiscountIds : [],
        ),
      ),
    );

    const quantityDiscountMap = new Map<
      string,
      { productId: string | null; buyQuantity: number; freeQuantity: number }
    >();

    if (allAppliedDiscountIds.length > 0) {
      const quantityDiscounts = await db.discount.findMany({
        where: {
          id: { in: allAppliedDiscountIds },
          type: "QUANTITY",
        },
        select: {
          id: true,
          productId: true,
          buyQuantity: true,
          freeQuantity: true,
        },
      });

      for (const discount of quantityDiscounts) {
        quantityDiscountMap.set(discount.id, {
          productId: discount.productId,
          buyQuantity: discount.buyQuantity ?? 0,
          freeQuantity: discount.freeQuantity ?? 0,
        });
      }
    }

    const allVoucherCodes = Array.from(
      new Set(
        orders.flatMap((order) =>
          Array.isArray(order.voucherCodes) ? order.voucherCodes : [],
        ),
      ),
    );

    const quantityVoucherMap = new Map<
      string,
      { productId: string | null; buyQuantity: number; freeQuantity: number }
    >();

    if (allVoucherCodes.length > 0) {
      const quantityVouchers = await db.voucher.findMany({
        where: {
          code: { in: allVoucherCodes },
          isSoftDeleted: false,
          discount: {
            isSoftDeleted: false,
            type: "QUANTITY",
          },
        },
        include: {
          discount: {
            select: {
              productId: true,
              buyQuantity: true,
              freeQuantity: true,
            },
          },
        },
      });

      for (const voucher of quantityVouchers) {
        quantityVoucherMap.set(voucher.code.trim().toLowerCase(), {
          productId: voucher.discount.productId,
          buyQuantity: voucher.discount.buyQuantity ?? 0,
          freeQuantity: voucher.discount.freeQuantity ?? 0,
        });
      }
    }

    const enrichedOrders = orders.map((order) => {
      const hasPromoToken = this.hasQuantityBonusTokenByPrefix(
        order.discountNames,
        "PROMO_QTY_BONUSES:",
      );
      const hasVoucherToken = this.hasQuantityBonusTokenByPrefix(
        order.discountNames,
        "VOUCHER_QTY_BONUSES:",
      );

      if (hasPromoToken && hasVoucherToken) {
        return order;
      }

      const promoToken = hasPromoToken
        ? null
        : this.buildPromoQuantityBonusToken(
            order.orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            order.appliedDiscountIds,
            quantityDiscountMap,
          );

      const voucherToken = hasVoucherToken
        ? null
        : this.buildVoucherQuantityBonusToken(
            order.orderItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            order.voucherCodes,
            quantityVoucherMap,
          );

      if (!promoToken && !voucherToken) {
        return order;
      }

      const mergedDiscountNames = [...order.discountNames];
      if (promoToken) {
        mergedDiscountNames.push(promoToken);
      }
      if (voucherToken) {
        mergedDiscountNames.push(voucherToken);
      }

      return {
        ...order,
        discountNames: mergedDiscountNames,
      };
    });

    return {
      data: enrichedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get order detail by ID with authorization check
   * @param orderId Order ID
   * @param userId User ID (validates ownership for regular users)
   * @param storeId Store ID (validates ownership for admins)
   * @returns Complete order with items and user details
   * @throws NotFoundError if order not found
   * @throws UnauthorizedError if user/store not authorized to view order
   * @note Enforces role-based access control
   */
  static async getOrderById(orderId: string, userId?: string, storeId?: string) {
    const db: PrismaClient = prisma;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
        user: { select: { id: true, email: true, name: true } },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // Authorization check
    if (userId) {
      // Regular user: can only see own orders
      if (order.userId !== userId) {
        throw new UnauthorizedError("Order does not belong to user");
      }
    } else if (storeId) {
      // Admin: can only see orders from their store
      if (order.storeId !== storeId) {
        throw new UnauthorizedError("Order does not belong to your store");
      }
    }

    const hasPromoToken = this.hasQuantityBonusTokenByPrefix(
      order.discountNames,
      "PROMO_QTY_BONUSES:",
    );
    const hasVoucherToken = this.hasQuantityBonusTokenByPrefix(
      order.discountNames,
      "VOUCHER_QTY_BONUSES:",
    );

    if (hasPromoToken && hasVoucherToken) {
      return order;
    }

    const quantityDiscountMap = new Map<
      string,
      { productId: string | null; buyQuantity: number; freeQuantity: number }
    >();

    if (Array.isArray(order.appliedDiscountIds) && order.appliedDiscountIds.length > 0) {
      const quantityDiscounts = await db.discount.findMany({
        where: {
          id: { in: order.appliedDiscountIds },
          type: "QUANTITY",
        },
        select: {
          id: true,
          productId: true,
          buyQuantity: true,
          freeQuantity: true,
        },
      });

      for (const discount of quantityDiscounts) {
        quantityDiscountMap.set(discount.id, {
          productId: discount.productId,
          buyQuantity: discount.buyQuantity ?? 0,
          freeQuantity: discount.freeQuantity ?? 0,
        });
      }
    }

    const quantityVoucherMap = new Map<
      string,
      { productId: string | null; buyQuantity: number; freeQuantity: number }
    >();

    if (Array.isArray(order.voucherCodes) && order.voucherCodes.length > 0) {
      const quantityVouchers = await db.voucher.findMany({
        where: {
          code: { in: order.voucherCodes },
          isSoftDeleted: false,
          discount: {
            isSoftDeleted: false,
            type: "QUANTITY",
          },
        },
        include: {
          discount: {
            select: {
              productId: true,
              buyQuantity: true,
              freeQuantity: true,
            },
          },
        },
      });

      for (const voucher of quantityVouchers) {
        quantityVoucherMap.set(voucher.code.trim().toLowerCase(), {
          productId: voucher.discount.productId,
          buyQuantity: voucher.discount.buyQuantity ?? 0,
          freeQuantity: voucher.discount.freeQuantity ?? 0,
        });
      }
    }

    const promoToken = hasPromoToken
      ? null
      : this.buildPromoQuantityBonusToken(
          order.orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          order.appliedDiscountIds,
          quantityDiscountMap,
        );

    const voucherToken = hasVoucherToken
      ? null
      : this.buildVoucherQuantityBonusToken(
          order.orderItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          order.voucherCodes,
          quantityVoucherMap,
        );

    if (!promoToken && !voucherToken) {
      return order;
    }

    const mergedDiscountNames = [...order.discountNames];
    if (promoToken) {
      mergedDiscountNames.push(promoToken);
    }
    if (voucherToken) {
      mergedDiscountNames.push(voucherToken);
    }

    return {
      ...order,
      discountNames: mergedDiscountNames,
    };

  }
}
