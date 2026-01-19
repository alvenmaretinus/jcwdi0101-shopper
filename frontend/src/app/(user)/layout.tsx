import { UserLayout } from "./(home)/_components/UserLayout";

export default function UserLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserLayout>{children}</UserLayout>;
}
