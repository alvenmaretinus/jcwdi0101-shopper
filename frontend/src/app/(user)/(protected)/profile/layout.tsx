import { ReactNode } from "react";
import { ProfileSidebar } from "./_components/ProfileSidebar";
import { MobileBottomNav } from "./_components/MobileBottomNav";
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
  if (!data) {
    return redirect("/login");
  }
  const user = data.user;
  const userFull = await getUserByEmail(user.email, nextHeaders);
  if (!userFull) {
    return redirect("/login");
  }
  userFull.name = user.name;

  return (
    <>
      <div
        className="max-w-6xl min-h-[calc(100vh-84px)] px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-12 lg:mx-auto pb-24 lg:pb-12"
      >
        {/* Desktop: Sidebar + Content Grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ProfileSidebar user={userFull} />
          </div>
          <div className="lg:col-span-3">{children}</div>
        </div>

        {/* Mobile: Just Content (Bottom nav handles navigation) */}
        <div className="lg:hidden">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
}
