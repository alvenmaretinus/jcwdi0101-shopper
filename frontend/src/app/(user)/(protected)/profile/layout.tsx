import { ReactNode } from "react";
import { ProfileSidebar } from "./_components/ProfileSidebar";
import { NAVBAR_HEIGHT } from "@/constants/navbar";

export default async function ProfileLayoutPage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className={`grid lg:grid-cols-4 max-w-6xl mb-10 min-[calc(100vh-${NAVBAR_HEIGHT}px)] lg:mb-0 px-10 py-16 lg:mx-auto gap-8`}
    >
      <div className="lg:col-span-1">
        <ProfileSidebar />
      </div>
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}
