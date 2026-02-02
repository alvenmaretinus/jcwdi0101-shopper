import { openCageFormatter } from "@/lib/openCageFormatter";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) return NextResponse.json("");

    const result = await getReverseGeoIdn({
      lat: Number(lat),
      lng: Number(lng),
    });
    return NextResponse.json(result || "");
  } catch (err) {
    console.error(err);
    return NextResponse.json("", { status: 500 });
  }
}

type Address = {
  city_block?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  postcode?: string;
  region?: string;
  country?: string;
};

async function getReverseGeoIdn({ lat, lng }: { lat: number; lng: number }) {
  const API_KEY = process.env.OPEN_CAGE_API_KEY;
  if (lat == null || lng == null) return "";

  try {
    const params = new URLSearchParams({
      key: API_KEY!,
      q: `${lat},${lng}`,
      countrycode: "id",
      limit: "1",
    });

    const res = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?${params}`
    );

    if (!res.ok) throw new Error();
    const data = await res.json();

    if (!data.results?.length) return "";

    const components = data.results[0].components as Address;

    const formatted = await openCageFormatter(components.postcode!);

    return formatted;
  } catch (err) {
    console.error(err);
    return "";
  }
}
