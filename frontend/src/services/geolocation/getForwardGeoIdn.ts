export async function getReverseGeoIdn({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}): Promise<string> {
  if (!lat || !lng) return "";

  try {
    const res = await fetch(`/api/reverse-geo-idn?lat=${lat}&lng=${lng}`, {});

    if (!res.ok) throw new Error();

    const results = await res.json();
    return results as string;
  } catch (err) {
    console.error(err);
    return "";
  }
}
