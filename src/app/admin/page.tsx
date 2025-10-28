import { requireAdminAuth } from "@/lib/auth/auth-server";
import { api } from "@/trpc/server";

export default async function AdminPage() {

  const users = await api.admin.getUsers();

  return (
    <div>
      <h1>Admin</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}