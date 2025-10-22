"use client";

import { signOut } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return <Button onClick={handleSignOut}>Logout</Button>;
}