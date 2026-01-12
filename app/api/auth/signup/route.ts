import { prisma } from "@/app/lib/db/client";
import { createClient } from "@/app/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  console.log(body);
  // await supabase.auth.signUp({
  //   email: "chinmareno2@gmail.com",
  //   password: "22222222222222",
  // });
  // await prisma.user.create({data:{email}})
  return new Response(JSON.stringify({ message: "posts" }), { status: 200 });
}
