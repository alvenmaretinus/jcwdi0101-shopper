import { UsersRepo } from "../repository/user/interface";
import { VoucherRepo } from "../repository/voucher/interface";
import { NotFoundError } from "../error/NotFoundError";
import { BadRequestError } from "../error/BadRequestError";
import { VoucherResponse } from "../repository/voucher/entity";
import { VoucherType } from "../../prisma/generated/client";
import Decimal from "decimal.js";

export class ReferralService {
  private usersRepo: UsersRepo;
  private voucherRepo: VoucherRepo;

  constructor(usersRepo: UsersRepo, voucherRepo: VoucherRepo) {
    this.usersRepo = usersRepo;
    this.voucherRepo = voucherRepo;
  }

  /**
   * Validate that a referral code exists and belongs to a valid user
   */
  async validateReferralCode(referralCode: string): Promise<boolean> {
    const users = await this.usersRepo.getUsersByFilter({ referralCode });
    return users.length > 0;
  }

  /**
   * Apply a referral code to a new user
   * This links the new user to the referrer and creates vouchers for both
   * Uses environment variables for referral discount configuration
   */
  async applyReferralCode(
    newUserId: string,
    referralCode: string
  ): Promise<{ referrerVoucher: VoucherResponse; refereeVoucher: VoucherResponse }> {
    const users = await this.usersRepo.getUsersByFilter({ id: newUserId });
    if (users.length === 0) {
      throw new NotFoundError("User not found");
    }

    const newUser = users[0];
    if (newUser.referredById) {
      throw new BadRequestError("Referral code can only be used once");
    }

    // Find the referrer by referral code
    const referrers = await this.usersRepo.getUsersByFilter({ referralCode });
    if (referrers.length === 0) {
      throw new NotFoundError("Invalid referral code");
    }
    const referrer = referrers[0];

    // Check if user is trying to use their own referral code
    if (referrer.id === newUserId) {
      throw new BadRequestError("Cannot use your own referral code");
    }

    // Atomically link user to referrer once (prevents switching/race duplicates)
    const didAssignReferral = await this.usersRepo.setReferredByOnce(newUserId, referrer.id);
    if (!didAssignReferral) {
      throw new BadRequestError("Referral code can only be used once");
    }

    // Get referral discount configuration from environment variables
    const discountConfig = {
      name: process.env.REFERRAL_DISCOUNT_NAME || "Referral Reward",
      type: (process.env.REFERRAL_DISCOUNT_TYPE || "PERCENTAGE") as "PERCENTAGE" | "FIXED_AMOUNT",
      percentage: process.env.REFERRAL_DISCOUNT_PERCENTAGE 
        ? new Decimal(process.env.REFERRAL_DISCOUNT_PERCENTAGE) 
        : undefined,
      amount: process.env.REFERRAL_DISCOUNT_AMOUNT 
        ? Number(process.env.REFERRAL_DISCOUNT_AMOUNT) 
        : undefined,
      isWithMinimum: process.env.REFERRAL_DISCOUNT_WITH_MINIMUM === "true",
      minimumPrice: process.env.REFERRAL_DISCOUNT_MINIMUM_PRICE 
        ? Number(process.env.REFERRAL_DISCOUNT_MINIMUM_PRICE) 
        : undefined,
      startsAt: process.env.REFERRAL_DISCOUNT_STARTS_AT 
        ? new Date(process.env.REFERRAL_DISCOUNT_STARTS_AT) 
        : undefined,
      endsAt: process.env.REFERRAL_DISCOUNT_ENDS_AT 
        ? new Date(process.env.REFERRAL_DISCOUNT_ENDS_AT) 
        : undefined,
      isQuantityLimited: true,
      maxUses: 1,
    };

    // Create vouchers for both referrer and referee
    // Each voucher creates its own discount instance with the same configuration
    const referrerVoucherCode = `REF-${referrer.id.substring(0, 8).toUpperCase()}-${Date.now()}`;
    const refereeVoucherCode = `REF-${newUserId.substring(0, 8).toUpperCase()}-${Date.now()}`;

    const referrerVoucher = await this.voucherRepo.createVoucher({
      code: referrerVoucherCode,
      userId: referrer.id,
      referralRole: "REFERRER",
      ...discountConfig,
      voucherType: VoucherType.REFERRAL,
    });

    const refereeVoucher = await this.voucherRepo.createVoucher({
      code: refereeVoucherCode,
      userId: newUserId,
      referralRole: "REFEREE",
      ...discountConfig,
      voucherType: VoucherType.REFERRAL,
    });

    return { referrerVoucher, refereeVoucher };
  }

  /**
   * Get user's referral statistics
   */
  async getReferralStats(userId: string) {
    const user = await this.usersRepo.getUsersByFilter({ id: userId });
    if (user.length === 0) {
      throw new NotFoundError("User not found");
    }

    return {
      referralCode: user[0].referralCode,
      totalReferrals: user[0].referrals.length,
      referrals: user[0].referrals.map(ref => ({
        id: ref.id,
        email: ref.email,
        createdAt: ref.createdAt,
      })),
    };
  }
}
