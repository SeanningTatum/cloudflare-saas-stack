import { auth } from "@/server/auth";
import { User } from "better-auth";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUser(): Promise<User | null> {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return null;
  }

  return sessionData.user as unknown as User;
}

export async function requireAuth(): Promise<User> | never {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminAuth(): Promise<User> | never {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/home");
  }

  return user;
}
