import type { CreateChargeResponse } from "@/services/order/createCharge";

export const loadMidtransSnap = async (
  transaction: CreateChargeResponse
): Promise<void> => {
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
  if (typeof window.snap !== "undefined") return;

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const snapUrl = transaction.redirectUrl?.includes("sandbox")
      ? "https://app.sandbox.midtrans.com/snap/snap.js"
      : "https://app.midtrans.com/snap/snap.js";
    script.src = snapUrl;
    if (clientKey) script.setAttribute("data-client-key", clientKey);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Midtrans Snap"));
    document.head.appendChild(script);
  });
};
