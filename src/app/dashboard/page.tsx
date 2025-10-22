import { SignOutButton } from "@/components/auth/signout-button";
import { DisplayHelloWorld } from "@/components/ai/display-hello-world";
import { getCurrentUser, requireAuth } from "@/lib/auth/auth-server";
import { api } from "@/trpc/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";


export default async function DashboardPage() {
  const session = await requireAuth();

  const authenticatedResponse = await api.sample.getSecretMessage();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.name}</p>
      <p>{authenticatedResponse.message}</p>

      <DisplayHelloWorld />

      <div className="flex gap-3 mt-4">
        <SignOutButton />
        <Link href="/dashboard/upload">
          <Button variant="outline">Try R2 Upload</Button>
        </Link>
      </div>

    </div>
  );
}