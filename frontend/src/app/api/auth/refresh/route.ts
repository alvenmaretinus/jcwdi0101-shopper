import { NextRequest } from "next/server";
import { forwardRequest } from "../../[resource]/route";

export async function POST(request: NextRequest) {
  return forwardRequest(request, "/api/auth/refresh");
}
