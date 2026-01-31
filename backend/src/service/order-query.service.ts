import { prisma } from "../lib/db/prisma";
import type { PrismaClient } from "../../prisma/generated/client";
import { NotFoundError } from "../error/NotFoundError";
import { UnauthorizedError } from "../error/UnauthorizedError";

/**
 * OrderQueryService: Handles order retrieval and search operations
 * Responsibilities:
 * - List orders with filters, pagination, sorting
 * - Get order detail
 */
export class OrderQueryService {
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

    return order;
  }
}
