import { apiFetch } from "@/lib/apiFetch";
import {
  UpdateStoreInput,
  UpdateStoreSchema,
} from "@/schemas/store/UpdateStoreSchema";
import { Store } from "@/types/Store";
import { toast } from "sonner";
import { getReverseGeoIdn } from "../geolocation/getReverseGeoIdn";

export const updateStore = async (inputData: UpdateStoreInput) => {
  const parseResult = UpdateStoreSchema.safeParse(inputData);

  if (!parseResult.success) {
    const firstError = parseResult.error.issues[0].message;
    if (typeof window !== "undefined") {
      toast.error(firstError || "Invalid input");
    }
    throw new Error(firstError);
  }

  const { id, ...data } = inputData;

  let postCode: string | undefined = undefined;
  if (data.lat && data.lng) {
    const { zip_code } = await getReverseGeoIdn({
      lat: data.lat,
      lng: data.lng,
    });
    postCode = zip_code;
    if (!zip_code) return toast.error("Only Indonesia is supported");
  }
  const res = await apiFetch<Store[]>(`/stores/${id}`, {
    method: "PATCH",
    body: { ...data, postCode },
  });
  return res;
};
