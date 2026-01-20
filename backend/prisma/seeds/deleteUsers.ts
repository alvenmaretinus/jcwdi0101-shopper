import { prisma } from "../../src/lib/db/prisma";
import { supabase } from "../../src/lib/supabase/server";

export const deleteUsers = async () => {
  const { data } = await supabase.auth.admin.listUsers();
  const users = data.users;
  for (const user of users) {
    await supabase.auth.admin.deleteUser(user.id);
  }
  await prisma.user.deleteMany();
};
