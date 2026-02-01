import { apiFetch } from "@/lib/apiFetch";
import {
  CreateUserAddressInput,
  CreateUserAddressSchema,
} from "@/schemas/user-address/CreateUserAddressSchema";
import { toast } from "sonner";
import { getReverseGeoIdn } from "../geolocation/getReverseGeoIdn";

export const createUserAddress = async (inputData: CreateUserAddressInput) => {
  const parseResult = CreateUserAddressSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }
  const { zip_code } = await getReverseGeoIdn({
    lat: inputData.latitude,
    lng: inputData.longitude,
  });
  if (!zip_code) return toast.error("Only Indonesia is supported");
  await apiFetch("/user-address", {
    method: "POST",
    body: { ...inputData, postCode: zip_code },
  });
};
