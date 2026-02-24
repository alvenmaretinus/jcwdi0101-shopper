import type { Prisma } from "../../prisma/generated/client";

type CompletionOrderSummary = {
  id: string;
  userId: string;
  subtotal: number;
};

type RewardGrantResult = {
  granted: boolean;
  voucherCode?: string;
  reason?: "SUBTOTAL_NOT_ELIGIBLE" | "COOLDOWN_ACTIVE";
};

export class OrderRewardService {
  private static readonly REWARD_DISCOUNT_NAME =
    process.env.ORDER_REWARD_DISCOUNT_NAME ?? "Weekly Free Shipping Reward";

  private static readonly MINIMUM_SUBTOTAL = this.getPositiveIntEnv(
    "ORDER_REWARD_MIN_SUBTOTAL",
    250000,
  );

  private static readonly VOUCHER_AMOUNT = this.getPositiveIntEnv(
    "ORDER_REWARD_VOUCHER_AMOUNT",
    20000,
  );

  private static readonly COOLDOWN_DAYS = this.getPositiveIntEnv(
    "ORDER_REWARD_COOLDOWN_DAYS",
    7,
  );

  private static readonly VALID_DAYS = this.getPositiveIntEnv(
    "ORDER_REWARD_VALID_DAYS",
    14,
  );

  private static getPositiveIntEnv(key: string, fallback: number): number {
    const parsed = Number(process.env[key]);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    return Math.floor(parsed);
  }

  private static generateRewardVoucherCode(userId: string, createdAt: Date): string {
    const userToken = userId.replace(/-/g, "").slice(0, 6).toUpperCase();
    const timeToken = createdAt.getTime().toString(36).toUpperCase();
    const randomToken = Math.floor(Math.random() * 36 ** 4)
      .toString(36)
      .toUpperCase()
      .padStart(4, "0");

    return `FSR-${userToken}-${timeToken}-${randomToken}`;
  }

  /**
   * Grants one FREEDELIVERY voucher when a user completes an eligible order.
   * Reward is limited to once every cooldown window per user.
   */
  static async grantCompletionRewardVoucher(
    tx: Prisma.TransactionClient,
    order: CompletionOrderSummary,
  ): Promise<RewardGrantResult> {
    if (order.subtotal < this.MINIMUM_SUBTOTAL) {
      return { granted: false, reason: "SUBTOTAL_NOT_ELIGIBLE" };
    }

    const now = new Date();
    const cooldownStart = new Date(
      now.getTime() - this.COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
    );

    const recentReward = await tx.voucher.findFirst({
      where: {
        userId: order.userId,
        voucherType: "FREEDELIVERY",
        isSoftDeleted: false,
        createdAt: { gte: cooldownStart },
        discount: {
          isSoftDeleted: false,
          isVoucher: true,
          name: this.REWARD_DISCOUNT_NAME,
        },
      },
      select: { id: true },
    });

    if (recentReward) {
      return { granted: false, reason: "COOLDOWN_ACTIVE" };
    }

    const startsAt = now;
    const endsAt = new Date(now.getTime() + this.VALID_DAYS * 24 * 60 * 60 * 1000);
    const voucherCode = this.generateRewardVoucherCode(order.userId, now);

    const discount = await tx.discount.create({
      data: {
        name: this.REWARD_DISCOUNT_NAME,
        amount: this.VOUCHER_AMOUNT,
        type: "FIXED_AMOUNT",
        isVoucher: true,
        isWithMinimum: false,
        isQuantityLimited: true,
        maxUses: 1,
        isTiedToProduct: false,
        startsAt,
        endsAt,
      },
    });

    await tx.voucher.create({
      data: {
        code: voucherCode,
        discountId: discount.id,
        userId: order.userId,
        voucherType: "FREEDELIVERY",
      },
    });

    return { granted: true, voucherCode };
  }
}
