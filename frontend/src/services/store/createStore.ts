import { apiFetch } from "@/lib/apiFetch";
import {
  CreateStoreInput,
  CreateStoreSchema,
} from "@/schemas/store/CreateStoreSchema";
import { Store } from "@/types/Store";
import { toast } from "sonner";
import { getReverseGeoIdn } from "../geolocation/getReverseGeoIdn";

export const createStore = async (inputData: CreateStoreInput) => {
  const parseResult = CreateStoreSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }
  const { zip_code } = await getReverseGeoIdn({
    lat: inputData.coords.lat,
    lng: inputData.coords.lng,
  });
  if (!zip_code) return toast.error("Only Indonesia is supported");

  const res = await apiFetch<Store>("/stores", {
    method: "POST",
    body: { ...inputData, postCode: zip_code },
  });
  return res;
};
