export function filterNonAdminUsers(userIds: string[]): string[] {
  return userIds.filter((id) => id !== "admin");
}
