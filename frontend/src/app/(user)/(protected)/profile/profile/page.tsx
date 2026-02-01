import { authClient } from "@/lib/authClient";
import { UserCard } from "./_components/UserPersonalCard";
import { ReferralCard } from "./_components/UserReferralCard";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserByEmail } from "@/services/user/getUserByEmail";

export default async function ProfilePage() {
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
    <div className="space-y-6">
      <div className="shadow-md rounded-xl">
        <UserCard user={userFull}/>
      </div>
      <div className="shadow-md rounded-xl">
        <ReferralCard referralCode={userFull.referralCode}/>
      </div>
    </div>
  );
}
