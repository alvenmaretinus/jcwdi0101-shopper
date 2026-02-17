import { z } from 'zod';

// Apply referral code - protected endpoint (called after user signs up)
export const applyReferralSchema = z.object({
  referralCode: z.string().min(1),
});