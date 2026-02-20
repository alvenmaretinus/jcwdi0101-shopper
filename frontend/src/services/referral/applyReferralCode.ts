import { apiFetch, HttpMethod } from "@/lib/apiFetch";

export interface ApplyReferralResult {
  referrerVoucher: { code: string };
  refereeVoucher: { code: string };
}

export async function applyReferralCode(
  referralCode: string
): Promise<ApplyReferralResult> {
  return apiFetch<ApplyReferralResult>("/referrals/apply", {
    method: HttpMethod.POST,
    body: { referralCode },
  });
}
