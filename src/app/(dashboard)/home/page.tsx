import { SignOutButton } from "@/components/auth/signout-button";
import { requireAuth } from "@/auth/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await requireAuth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.name}</p>

      <div className="flex gap-3 mt-4">
        <SignOutButton />
        <Link href="/dashboard/upload">
          <Button variant="outline">Try R2 Upload</Button>
        </Link>
      </div>
    </div>
  );
}