import { getAuth } from "@/server/auth";
import { headers } from "next/headers";
import { User } from "better-auth";

export async function getCurrentUser(): Promise<User | null> {
  const auth = await getAuth();

  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData) {
    return null;
  }

  return sessionData.user;
}
