import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json("");
    }

    const result = await getReverseGeoIdn({
      lat: Number(lat),
      lng: Number(lng),
    });

    if (!result) return NextResponse.json("");

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json("", { status: 500 });
  }
}

export type ReverseGeoResponse = {
  results: {
    formatted: { name: string };
  }[];
};
async function getReverseGeoIdn({ lat, lng }: { lat: number; lng: number }) {
  const API_KEY = process.env.OPEN_CAGE_API_KEY;
  if (lat == null || lng == null) return "";

  try {
    const res = await axios.get<ReverseGeoResponse>(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          key: API_KEY,
          q: `${lat},${lng}`,
          countrycode: "id",
          limit: 1,
          no_annotations: 1,
        },
      }
    );

    if (!res.data.results || res.data.results.length === 0) return "";

    return res.data.results[0].formatted;
  } catch (err) {
    console.error(err);
    return "";
  }
}
