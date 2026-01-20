type UserPayload = {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
};

export const UserProtectedLayoutPage = () => {
  const user = useUser();

  return <div></div>;
};
