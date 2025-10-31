"use client";

import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    authClient.signOut();
    router.push("/");
  }

  return <Button onClick={handleSignOut}>Logout</Button>;
}