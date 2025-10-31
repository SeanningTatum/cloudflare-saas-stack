import { User } from "@/server/db/schema";

export function filterNonAdminUsers(
  userIds: string[],
  users: User[]
): string[] {
  const adminUserIds = users
    .filter((user) => user.role === "admin")
    .map((user) => user.id);

  return userIds.filter((id) => !adminUserIds.includes(id));
}
