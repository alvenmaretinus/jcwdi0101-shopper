import { MIN_LOCATION_SEARCH_LENGTH } from "@/constants/geo";
import { toast } from "sonner";

type GeoResult = {
  lat: number;
  lng: number;
  name: string;
};

export async function getForwardGeoIdn(
  location: string
): Promise<GeoResult[] | null> {
  if (!location || location.length < MIN_LOCATION_SEARCH_LENGTH) return null;

  try {
    const res = await fetch(
      `/api/forward-geo-idn?q=${encodeURIComponent(location)}`
    );

    if (!res.ok) throw new Error();

    const results = await res.json();
    return results as GeoResult[];
  } catch (err) {
    console.error(err);
    toast.error("Failed to get location");
    return null;
  }
}
