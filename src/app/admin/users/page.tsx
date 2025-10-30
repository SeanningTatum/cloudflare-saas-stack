"use client"

import { toast } from "sonner"

import { SiteHeader } from "@/components/dashboard/site-header"
import { UsersDataTable } from "@/components/admin/users-data-table"
import { api } from "@/trpc/client"
import { filterNonAdminUsers } from "@/lib/auth"

export default function UsersPage() {
  const utils = api.useUtils()
  const { data: usersData, isLoading } = api.admin.getUsers.useQuery({
    page: 0,
    limit: 100,
  })

  // MARK:- Bulk mutations
  const bulkBanMutation = api.admin.bulkBanUsers.useMutation({
    onSuccess: () => {
      toast.success("Users banned successfully")
      utils.admin.getUsers.invalidate()
    },
    onError: () => {
      toast.error("Failed to ban users")
    },
  })
  const bulkDeleteMutation = api.admin.bulkDeleteUsers.useMutation({
    onSuccess: () => {
      toast.success("Users deleted successfully")
      utils.admin.getUsers.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete users")
    },
  })
  const bulkUpdateRoleMutation = api.admin.bulkUpdateUserRoles.useMutation({
    onSuccess: () => {
      toast.success("Users role updated successfully")
      utils.admin.getUsers.invalidate()
    },
    onError: () => {
      toast.error("Failed to update users role")
    },
  })

  // MARK:- Single user mutations
  const banUserMutation = api.admin.banUser.useMutation({
    onSuccess: () => {
      toast.success("User banned successfully")
      utils.admin.getUsers.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to ban user")
    },
  })

  const unbanUserMutation = api.admin.unbanUser.useMutation({
    onSuccess: () => {
      toast.success("User unbanned successfully")
      utils.admin.getUsers.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unban user")
    },
  })

  const deleteUserMutation = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully")
      utils.admin.getUsers.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user")
    },
  })

  const updateUserRoleMutation = api.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User role updated successfully")
      utils.admin.getUsers.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role")
    },
  })


  // Bulk action handlers
  async function handleBulkBan(userIds: string[]) {
    const filteredUserIds = filterNonAdminUsers(userIds)
    if (filteredUserIds.length === 0) {
      toast.error("Cannot perform action on admin users")
      return
    }
    if (filteredUserIds.length < userIds.length) {
      toast.info("Admin users were excluded from this action")
    }
    bulkBanMutation.mutate({
      userIds: filteredUserIds,
      reason: "Bulk ban by admin",
    })
  }

  async function handleBulkDelete(userIds: string[]) {
    const filteredUserIds = filterNonAdminUsers(userIds)
    if (filteredUserIds.length === 0) {
      toast.error("Cannot perform action on admin users")
      return
    }
    if (filteredUserIds.length < userIds.length) {
      toast.info("Admin users were excluded from this action")
    }
    bulkDeleteMutation.mutate({ userIds: filteredUserIds })
  }

  async function handleBulkUpdateRole(userIds: string[], role: "user" | "admin") {
    const filteredUserIds = filterNonAdminUsers(userIds)
    if (filteredUserIds.length === 0) {
      toast.error("Cannot perform action on admin users")
      return
    }
    if (filteredUserIds.length < userIds.length) {
      toast.info("Admin users were excluded from this action")
    }
    bulkUpdateRoleMutation.mutate({ userIds: filteredUserIds, role })
  }

  // Single user action handlers
  async function handleBanUser(userId: string) {
    const user = usersData?.find((u) => u.id === userId)
    if (user?.role === "admin") {
      toast.error("Cannot ban admin users")
      return
    }
    banUserMutation.mutate({ userId, reason: "Banned by admin" })
  }

  async function handleUnbanUser(userId: string) {
    unbanUserMutation.mutate({ userId })
  }

  async function handleDeleteUser(userId: string) {
    const user = usersData?.find((u) => u.id === userId)
    if (user?.role === "admin") {
      toast.error("Cannot delete admin users")
      return
    }
    deleteUserMutation.mutate({ userId })
  }

  async function handleUpdateUserRole(userId: string, role: "user" | "admin") {
    const user = usersData?.find((u) => u.id === userId)
    if (user?.role === "admin") {
      toast.error("Cannot modify admin user roles")
      return
    }
    updateUserRoleMutation.mutate({
      userId,
      data: { role },
    })
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
            onBanUser={handleBanUser}
            onUnbanUser={handleUnbanUser}
            onDeleteUser={handleDeleteUser}
            onUpdateUserRole={handleUpdateUserRole}
          />
        )}
      </div>
    </>
  )
}