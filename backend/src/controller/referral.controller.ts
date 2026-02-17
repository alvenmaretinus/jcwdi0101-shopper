import { Router } from "express";
import { ReferralService } from "../service/referral.service";
import { PostgresRepository as UsersRepository } from "../repository/user/adapter_prisma";
import { PrismaVoucherRepository as VoucherRepository } from "../repository/voucher/adapter_prisma";
import { prisma } from "../lib/db/prisma";
import { isAuth } from "../middleware/isAuth";
import { applyReferralSchema } from "../schema/referral/ApplyReferralSchema";

const router = Router();

const usersRepository = new UsersRepository(prisma);
const voucherRepository = new VoucherRepository(prisma);
const referralService = new ReferralService(usersRepository, voucherRepository);

// Validate referral code - public endpoint
router.get("/referrals/validate/:code", async (req, res) => {
  const { code } = req.params;
  const isValid = await referralService.validateReferralCode(code);
  return res.json({ valid: isValid });
});

// Get user's referral statistics - protected endpoint
router.get("/referrals/stats", isAuth, async (req, res) => {
  const userId = req.user!.id;
  const stats = await referralService.getReferralStats(userId);
  return res.json(stats);
});



router.post("/referrals/apply", isAuth, async (req, res) => {
  const input = applyReferralSchema.parse(req.body);
  const userId = req.user!.id;
  
  const result = await referralService.applyReferralCode(
    userId,
    input.referralCode
  );
  
  return res.json(result);
});

export default router;
