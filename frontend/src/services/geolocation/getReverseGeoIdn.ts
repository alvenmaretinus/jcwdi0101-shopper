export async function getReverseGeoIdn({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  if (!lat || !lng)
    return {
      zip_code: "",
      label: "",
    };

  const res = await fetch(`/api/reverse-geo-idn?lat=${lat}&lng=${lng}`);
  if (!res.ok) throw new Error();

  const results = await res.json();

  return results as {
    zip_code: string;
    label: string;
  };
}
