import { MIN_LOCATION_SEARCH_LENGTH } from "@/constants/geo";
import axios from "axios";
import { toast } from "sonner";

export async function getForwardGeoIdn(location: string) {
  if (!location || location.length < MIN_LOCATION_SEARCH_LENGTH) return null;

  try {
    const res = await axios.get<
      {
        lat: number;
        lng: number;
        name: string;
      }[]
    >("/api/forward-geo-idn", {
      params: { q: location },
    });

    return res.data;
  } catch (err: any) {
    console.error(err);
    toast.error("Failed to get location");
    return null;
  }
}
