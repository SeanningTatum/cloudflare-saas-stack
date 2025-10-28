import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { User } from "better-auth";
import { redirect } from "next/navigation";

export async function getCurrentUser(): Promise<User | null> {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return null;
  }

  return sessionData.user;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
