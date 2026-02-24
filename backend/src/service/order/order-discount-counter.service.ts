import type { PrismaClient } from "../../../prisma/generated/client";

export class OrderDiscountCounterService {
  private static isDiscountApplicable(
    discount: {
      startsAt: Date | null;
      endsAt: Date | null;
      isWithMinimum: boolean;
      minimumPrice: number | null;
      isQuantityLimited: boolean;
      maxUses: number | null;
      useCounter: number;
    },
    subtotal: number,
  ) {
    const now = new Date();
    const hasStarted = !discount.startsAt || discount.startsAt <= now;
    const hasNotEnded = !discount.endsAt || discount.endsAt >= now;
    const minimumPassed = !discount.isWithMinimum || discount.minimumPrice === null || subtotal >= discount.minimumPrice;
    const available = !discount.isQuantityLimited || (discount.maxUses !== null && discount.useCounter < discount.maxUses);
    return hasStarted && hasNotEnded && minimumPassed && available;
  }

  static async incrementAppliedDiscountCounters(
    userId: string,
    subtotal: number,
    db: PrismaClient,
    discountIds?: string[],
    voucherIds?: string[],
  ) {
    const applicableDiscountIds = new Set<string>();

    if (discountIds && discountIds.length > 0) {
      const discounts = await db.discount.findMany({
        where: {
          id: { in: discountIds },
          isSoftDeleted: false,
        },
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          isWithMinimum: true,
          minimumPrice: true,
          isQuantityLimited: true,
          maxUses: true,
          useCounter: true,
          hasDiscountAmountCap: true,
          maxDiscountAmount: true,
        },
      });

      for (const discount of discounts) {
        if (this.isDiscountApplicable(discount, subtotal)) {
          applicableDiscountIds.add(discount.id);
        }
      }
    }

    if (voucherIds && voucherIds.length > 0) {
      const vouchers = await db.voucher.findMany({
        where: {
          isSoftDeleted: false,
          OR: [{ id: { in: voucherIds } }, { code: { in: voucherIds } }],
          discount: {
            isSoftDeleted: false,
          },
        },
        include: {
          discount: {
            select: {
              id: true,
              startsAt: true,
              endsAt: true,
              isWithMinimum: true,
              minimumPrice: true,
              isQuantityLimited: true,
              maxUses: true,
              useCounter: true,
            },
          },
        },
      });

      for (const voucher of vouchers) {
        if (voucher.voucherType === "REFERRAL" && voucher.userId !== userId) {
          continue;
        }

        if (this.isDiscountApplicable(voucher.discount, subtotal)) {
          applicableDiscountIds.add(voucher.discount.id);
        }
      }
    }

    await Promise.all(
      Array.from(applicableDiscountIds).map((discountId) =>
        db.discount.updateMany({
          where: {
            id: discountId,
            isQuantityLimited: true,
            maxUses: { not: null },
            useCounter: {
              lt: db.discount.fields.maxUses as any,
            },
          },
          data: {
            useCounter: { increment: 1 },
          },
        }),
      ),
    );
  }

  static async decrementAppliedDiscountCounters(
    userId: string,
    db: PrismaClient,
    discountIds?: string[],
    voucherIds?: string[],
  ) {
    const applicableDiscountIds = new Set<string>();

    if (discountIds && discountIds.length > 0) {
      const discounts = await db.discount.findMany({
        where: {
          id: { in: discountIds },
          isSoftDeleted: false,
        },
        select: {
          id: true,
          isQuantityLimited: true,
          maxUses: true,
          useCounter: true,
        },
      });

      for (const discount of discounts) {
        if (discount.isQuantityLimited && discount.maxUses !== null && discount.useCounter > 0) {
          applicableDiscountIds.add(discount.id);
        }
      }
    }

    if (voucherIds && voucherIds.length > 0) {
      const vouchers = await db.voucher.findMany({
        where: {
          isSoftDeleted: false,
          OR: [{ id: { in: voucherIds } }, { code: { in: voucherIds } }],
          discount: {
            isSoftDeleted: false,
          },
        },
        include: {
          discount: {
            select: {
              id: true,
              isQuantityLimited: true,
              maxUses: true,
              useCounter: true,
            },
          },
        },
      });

      for (const voucher of vouchers) {
        if (voucher.voucherType === "REFERRAL" && voucher.userId !== userId) {
          continue;
        }

        if (voucher.discount.isQuantityLimited && voucher.discount.maxUses !== null && voucher.discount.useCounter > 0) {
          applicableDiscountIds.add(voucher.discount.id);
        }
      }
    }

    await Promise.all(
      Array.from(applicableDiscountIds).map((discountId) =>
        db.discount.updateMany({
          where: {
            id: discountId,
            isQuantityLimited: true,
            maxUses: { not: null },
            useCounter: { gt: 0 },
          },
          data: {
            useCounter: { decrement: 1 },
          },
        }),
      ),
    );
  }
}
