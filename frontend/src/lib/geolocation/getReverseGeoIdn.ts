import axios from "axios";

export async function getReverseGeoIdn({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  if (!lat || !lng) return "";

  try {
    const res = await axios.get<string>("/api/reverse-geo-idn", {
      params: { lng, lat },
    });

    return res.data;
  } catch (err) {
    console.error(err);
    return "";
  }
}
