import { NextRequest, NextResponse } from "next/server";

const apiBaseUrl = process.env.API_BASE_URL;

export async function forwardRequest(request: NextRequest, endpoint: string) {
  try {
    const url = `${apiBaseUrl}/${endpoint}`;

    // Forward the request to the backend API
    const response = await fetch(url, {
      method: request.method,
      headers: request.headers,
      body: ["POST", "PUT", "PATCH"].includes(request.method)
        ? await request.text()
        : undefined,
    });

    const responseBody = await response.text();
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      headers: response.headers,
    });

    if (typeof response.headers.getSetCookie === "function") {
      const cookies = response.headers.getSetCookie();
      cookies.forEach((cookie) => {
        nextResponse.headers.append("Set-Cookie", cookie);
      });
    } else {
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        nextResponse.headers.set("Set-Cookie", setCookieHeader);
      }
    }

    return nextResponse;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  return forwardRequest(request, params.resource);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  return forwardRequest(request, params.resource);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  return forwardRequest(request, params.resource);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  return forwardRequest(request, params.resource);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  return forwardRequest(request, params.resource);
}
