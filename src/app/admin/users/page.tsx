"use client"

import { SiteHeader } from "@/components/dashboard/site-header"
import { UsersDataTable, type User } from "@/components/admin/users-data-table"
import { api } from "@/trpc/client"
import { toast } from "sonner"

export default function UsersPage() {
  const { data: usersData, isLoading } = api.admin.getUsers.useQuery({
    page: 0,
    limit: 100,
  })

  const bulkBanMutation = api.admin.bulkBanUsers.useMutation({
    onSuccess: () => {
      toast.success("Users banned successfully")
    },
    onError: () => {
      toast.error("Failed to ban users")
    },
  })
  const bulkDeleteMutation = api.admin.bulkDeleteUsers.useMutation({
    onSuccess: () => {
      toast.success("Users deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete users")
    },
  })
  const bulkUpdateRoleMutation = api.admin.bulkUpdateUserRoles.useMutation({
    onSuccess: () => {
      toast.success("Users role updated successfully")
    },
    onError: () => {
      toast.error("Failed to update users role")
    },
  })

  async function handleBulkBan(userIds: string[]) {
    bulkBanMutation.mutate({
      userIds,
      reason: "Bulk ban by admin",
    })
  }

  async function handleBulkDelete(userIds: string[]) {
    bulkDeleteMutation.mutate({ userIds })
  }

  async function handleBulkUpdateRole(userIds: string[], role: "user" | "admin") {
    bulkUpdateRoleMutation.mutate({ userIds, role })
  }

  return (
    <>
      <SiteHeader title="Users" />
      <div className="flex flex-col gap-6 p-4 lg:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : (
          <UsersDataTable
            data={usersData ?? []}
            onBulkBan={handleBulkBan}
            onBulkDelete={handleBulkDelete}
            onBulkUpdateRole={handleBulkUpdateRole}
          />
        )}
      </div>
    </>
  )
}