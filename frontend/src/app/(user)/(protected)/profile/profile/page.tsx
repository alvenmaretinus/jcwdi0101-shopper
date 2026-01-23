import { UserCard } from "./_components/UserPersonalCard";
import { ReferralCard } from "./_components/UserReferralCard";

export default function page() {
  return (
    <div className="space-y-6">
      <div className="shadow-md rounded-xl">
        <UserCard />
      </div>
      <div className="shadow-md rounded-xl">
        <ReferralCard />
      </div>
    </div>
  );
}
