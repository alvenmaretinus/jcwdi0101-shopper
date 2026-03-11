import type { CreateDiscountInput } from "@/services/discount";
import type { ProductWithDetails } from "@/services/product/getProducts";
import type { CreateVoucherInput } from "@/services/voucher";
import type { DiscountType, VoucherType } from "./promoOptions";

interface MapperResult<T> {
  data?: T;
  error?: string;
}

export function mapDiscountFormData(
  formData: FormData,
  selectedProduct: ProductWithDetails | null
): MapperResult<CreateDiscountInput> {
  const type = formData.get("type") as DiscountType;
  const endsAt = formData.get("endsAt") as string;
  const startsAt = formData.get("startsAt") as string;
  const rawValue = (formData.get("value") as string) ?? "";

  const discountData: CreateDiscountInput = {
    name: formData.get("name") as string,
    type,
    isWithMinimum: formData.has("isWithMinimum"),
    isTiedToProduct: !!selectedProduct?.id,
    productId: selectedProduct?.id,
  };

  if (type === "PERCENTAGE") {
    discountData.percentage = Number(rawValue);
  } else if (type === "FIXED_AMOUNT") {
    const amount = Number(rawValue);
    if (!Number.isInteger(amount)) {
      return { error: "Fixed amount must be a whole number" };
    }
    discountData.amount = amount;
  } else {
    const buyQuantity = Number(formData.get("buyQuantity"));
    const freeQuantity = Number(formData.get("freeQuantity"));

    if (!Number.isInteger(buyQuantity) || !Number.isInteger(freeQuantity)) {
      return { error: "Buy and free quantities must be whole numbers" };
    }

    discountData.buyQuantity = buyQuantity;
    discountData.freeQuantity = freeQuantity;
  }

  if (formData.get("minimumPrice")) {
    const minimumPrice = Number(formData.get("minimumPrice"));
    if (!Number.isInteger(minimumPrice)) {
      return { error: "Minimum purchase must be a whole number" };
    }
    discountData.minimumPrice = minimumPrice;
  }

  if (type === "PERCENTAGE" && formData.has("hasDiscountAmountCap")) {
    discountData.hasDiscountAmountCap = true;
    const maxDiscountAmount = Number(formData.get("maxDiscountAmount"));
    if (!Number.isInteger(maxDiscountAmount) || maxDiscountAmount < 1) {
      return { error: "Max discount amount must be a whole number greater than 0" };
    }
    discountData.maxDiscountAmount = maxDiscountAmount;
  } else {
    discountData.hasDiscountAmountCap = false;
  }

  if (startsAt) {
    discountData.startsAt = new Date(startsAt);
  }

  if (endsAt) {
    discountData.endsAt = new Date(endsAt);
  }

  return { data: discountData };
}

export function mapVoucherFormData(formData: FormData): MapperResult<CreateVoucherInput> {
  const type = formData.get("voucherDiscountType") as DiscountType;
  const endsAt = formData.get("voucherEndsAt") as string;
  const startsAt = formData.get("voucherStartsAt") as string;

  const voucherData: CreateVoucherInput = {
    code: (formData.get("voucherCode") as string).toUpperCase(),
    name: formData.get("voucherName") as string,
    type,
    voucherType: formData.get("voucherType") as VoucherType,
    isWithMinimum: formData.has("voucherIsWithMinimum"),
  };

  if (type === "PERCENTAGE") {
    voucherData.percentage = Number(formData.get("voucherValue"));
  } else if (type === "FIXED_AMOUNT") {
    voucherData.amount = Number(formData.get("voucherValue"));
  } else {
    voucherData.buyQuantity = Number(formData.get("voucherBuyQuantity"));
    voucherData.freeQuantity = Number(formData.get("voucherFreeQuantity"));
  }

  if (formData.get("voucherMinimumPrice")) {
    voucherData.minimumPrice = Number(formData.get("voucherMinimumPrice"));
  }

  if (startsAt) {
    voucherData.startsAt = new Date(startsAt);
  }

  if (endsAt) {
    voucherData.endsAt = new Date(endsAt);
  }

  return { data: voucherData };
}
