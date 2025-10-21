import { SignOutButton } from "@/features/auth/components/signout-button";
import { getCurrentUser } from "@/features/auth/lib/auth-server";
import { api } from "@/features/core/trpc/server";
import { redirect } from "next/navigation";


export default async function DashboardPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  const authenticatedResponse = await api.sample.getSecretMessage();


  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.name}</p>
      <p>{authenticatedResponse.message}</p>
      <SignOutButton />
    </div>
  );
}