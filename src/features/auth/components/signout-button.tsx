"use client";

import { signOut } from "@/features/auth/lib/auth-client";
import { Button } from "@/features/core/components/ui/button";

export function SignOutButton() {
  return <Button onClick={() => signOut()}>Logout</Button>;
}