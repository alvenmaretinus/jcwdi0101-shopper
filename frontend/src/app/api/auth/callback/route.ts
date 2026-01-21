import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const apiBaseUrl = process.env.API_BASE_URL;
  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        console.error("Supabase Exchange Error:", error);
        return NextResponse.redirect(origin + "/login");
      }

      // Send the session tokens to your backend
      const response = await fetch(`${apiBaseUrl}/api/auth/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        }),
      });

      const url = new URL(origin); 
      const nextResponse = NextResponse.redirect(url);

      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        if (typeof response.headers.getSetCookie === "function") {
          response.headers.getSetCookie().forEach((cookie) => {
            nextResponse.headers.append("Set-Cookie", cookie);
          });
        } else {
          nextResponse.headers.set("Set-Cookie", setCookieHeader);
        }
      }

      return nextResponse;
    } catch (error) {
      console.log(error);
      return NextResponse.redirect(origin + "/login");
    }
  }
  return NextResponse.redirect(origin + "/login");
}
