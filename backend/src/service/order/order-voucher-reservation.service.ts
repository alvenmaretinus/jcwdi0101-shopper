import { BadRequestError } from "../../error/BadRequestError";
import type { PrismaClient } from "../../../prisma/generated/client";
import type { VoucherReservationCandidate } from "./order.types";

export class OrderVoucherReservationService {
  static serializeVoucherAppliedAmounts(
    voucherAppliedAmounts: Array<{ code: string; savedAmount: number }>,
  ): string | null {
    if (!voucherAppliedAmounts || voucherAppliedAmounts.length === 0) {
      return null;
    }

    const pairs = voucherAppliedAmounts
      .map((line) => ({
        code: String(line.code ?? "").trim(),
        savedAmount: Math.max(0, Number(line.savedAmount) || 0),
      }))
      .filter((line) => line.code.length > 0 && line.savedAmount > 0)
      .map((line) => `${line.code}:${line.savedAmount}`);

    if (pairs.length === 0) {
      return null;
    }

    return `VOUCHER_APPLIED_AMOUNTS:${pairs.join("|")}`;
  }

  static serializeQuantityBonuses(
    prefix: string,
    quantityBonuses: Array<{ productId: string; freeQuantity: number }>,
  ): string | null {
    if (!quantityBonuses || quantityBonuses.length === 0) {
      return null;
    }

    const pairs = quantityBonuses
      .map((line) => ({
        productId: String(line.productId ?? "").trim(),
        freeQuantity: Math.max(0, Number(line.freeQuantity) || 0),
      }))
      .filter((line) => line.productId.length > 0 && line.freeQuantity > 0)
      .map((line) => `${line.productId}:${line.freeQuantity}`);

    if (pairs.length === 0) {
      return null;
    }

    return `${prefix}:${pairs.join("|")}`;
  }

  static serializeVoucherQuantityBonuses(
    quantityBonuses: Array<{ productId: string; freeQuantity: number }>,
  ): string | null {
    return this.serializeQuantityBonuses(
      "VOUCHER_QTY_BONUSES",
      quantityBonuses,
    );
  }

  static async enforceVoucherReservationConstraints(
    db: PrismaClient,
    vouchers: VoucherReservationCandidate[],
  ): Promise<void> {
    if (!vouchers || vouchers.length === 0) {
      return;
    }

    const activePendingOrders = await db.order.findMany({
      where: {
        status: {
          in: ["PAYMENT_PENDING", "PAYMENT_WAITING_CONFIRMATION"],
        },
      },
      select: {
        id: true,
        voucherCodes: true,
      },
    });

    for (const voucher of vouchers) {
      const voucherKeys = new Set([
        voucher.id.trim().toLowerCase(),
        voucher.code.trim().toLowerCase(),
      ]);

      const activeUsageCount = activePendingOrders.reduce((count, order) => {
        const isUsed = order.voucherCodes.some((voucherCode) =>
          voucherKeys.has(voucherCode.trim().toLowerCase()),
        );
        return count + (isUsed ? 1 : 0);
      }, 0);

      const oneTimeVoucher =
        voucher.userId !== null ||
        voucher.voucherType === "REFERRAL" ||
        (voucher.discount.isQuantityLimited && voucher.discount.maxUses === 1);

      if (oneTimeVoucher && activeUsageCount > 0) {
        throw new BadRequestError(
          `Voucher is currently used in another active order: ${voucher.code}`,
        );
      }

      if (voucher.discount.isQuantityLimited && voucher.discount.maxUses !== null) {
        const projectedUsage = voucher.discount.useCounter + activeUsageCount;
        if (projectedUsage >= voucher.discount.maxUses) {
          throw new BadRequestError(
            `Voucher quota reached. Please remove voucher: ${voucher.code}`,
          );
        }
      }
    }
  }
}
