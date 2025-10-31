"use client"

import { IconAlertTriangle, IconX } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth/auth-client"

export function ImpersonationBanner() {
  const router = useRouter()
  const { data, refetch } = authClient.useSession()
  const isImpersonating = !!data?.session?.impersonatedBy

  async function handleStopImpersonating() {
    try {
      await authClient.admin.stopImpersonating()
      // Refetch the session to update the UI immediately
      refetch()
      toast.success("Stopped impersonating user")
      router.push("/admin/users")
    } catch (error) {
      toast.error("Failed to stop impersonating")
    }
  }

  if (!isImpersonating) {
    return null
  }

  return (
    <div className="bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-100 flex items-center justify-between gap-4 border-b px-4 py-3 absolute top-4 right-4 rounded-md">
      <div className="flex items-center gap-2">
        <IconAlertTriangle className="size-5" />
        <p className="text-sm font-medium">
          You are currently impersonating{" "}
          {data?.user?.name}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleStopImpersonating}
        className="bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/30 hover:border-amber-500/40 gap-1"
      >
        <IconX className="size-4" />
        Stop Impersonating
      </Button>
    </div>
  )
}

