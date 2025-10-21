"use client";

import { signOut } from "@/features/auth/lib/auth-client";
import { Button } from "@/features/core/components/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return <Button onClick={handleSignOut}>Logout</Button>;
}