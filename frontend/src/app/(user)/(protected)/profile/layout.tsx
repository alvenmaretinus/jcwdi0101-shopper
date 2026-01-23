import { ReactNode } from "react";
import { ProfileSidebar } from "./_components/ProfileSidebar";

export default async function ProfileLayoutPage({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="bg-neutral- grid lg:grid-cols-4 mt-14 max-w-6xl mb-10 lg:mb-0 mx-10 min-h-screen lg:mx-auto gap-8">
      <div className="lg:col-span-1">
        <ProfileSidebar />
      </div>
      <div className="lg:col-span-3">{children}</div>
    </div>
  );
}
