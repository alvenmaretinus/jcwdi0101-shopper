import { MIN_LOCATION_SEARCH_LENGTH } from "@/constant/geo";
import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("q");

    if (!location || location.length < MIN_LOCATION_SEARCH_LENGTH) {
      return NextResponse.json(null);
    }

    const results = await getForwardGeoIdnOpenCage(location);

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json([], { status: 500 });
  }
}

type ForwardGeoResponse = {
  results: {
    formatted: string;
    geometry: { lat: number; lng: number };
  }[];
};
async function getForwardGeoIdnOpenCage(location: string) {
  const API_KEY = process.env.OPEN_CAGE_API_KEY;
  if (!location) return null;

  try {
    const res = await axios.get<ForwardGeoResponse>(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          key: API_KEY,
          q: location,
          countrycode: "id",
          limit: 4,
          no_annotations: 1,
        },
      }
    );
    const results = res.data.results;

    if (!results || results.length === 0) return null;

    return results.map((r) => ({
      lat: r.geometry.lat,
      lng: r.geometry.lng,
      name: r.formatted,
    }));
  } catch (err) {
    console.error(err);
    return null;
  }
}
