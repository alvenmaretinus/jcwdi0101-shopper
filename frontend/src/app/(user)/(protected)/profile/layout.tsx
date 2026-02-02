import { ReactNode } from "react";
import { ProfileSidebar } from "./_components/ProfileSidebar";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/authClient";
import { headers } from "next/headers";
import { getUserByEmail } from "@/services/user/getUserByEmail";

export default async function ProfileLayoutPage({
  children,
}: {
  children: ReactNode;
}) {
    const nextHeaders = await headers();
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: nextHeaders,
    },
  });
  if(!data){
    return redirect("/login");
  }
  const user=data.user;
  const userFull=await getUserByEmail(user.email,nextHeaders);
  if(!userFull){
    return redirect("/login");
  } 
userFull.name=user.name;

  return (
    <div
      className={`grid lg:grid-cols-4 max-w-6xl mb-10 min-h-[calc(100vh-84px)] lg:mb-0 px-10 py-16 lg:mx-auto gap-8`}
    >
      <div className="lg:col-span-1">
        <ProfileSidebar  user={userFull}/>
      </div>
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}
