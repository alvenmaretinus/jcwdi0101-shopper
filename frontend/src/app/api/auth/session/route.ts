import { forwardRequest } from "../../[resource]/route";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return forwardRequest(request, "/api/auth/session");
}
