"use client"

import { useState } from "react"
import { IconUsers, IconLoader2 } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api } from "@/trpc/client"
import { toast } from "sonner"
import { SiteHeader } from "@/components/dashboard/site-header"

export default function DebugPage() {
  const [customCount, setCustomCount] = useState("10")
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user")
  const [customPassword, setCustomPassword] = useState("Password123!")

  const seedUsersMutation = api.debug.seedUsers.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully seeded ${data.count} users!`)
    },
    onError: (error) => {
      toast.error(`Failed to seed users: ${error.message}`)
    },
  })

  function handleSeedUsers(count: number) {
    seedUsersMutation.mutate({
      count,
      role: selectedRole,
      password: customPassword,
    })
  }

  const isLoading = seedUsersMutation.isPending

  return (
    <>
      <SiteHeader title="Debug Tools" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-6 py-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="size-5" />
              Seed Users
            </CardTitle>
            <CardDescription>
              Generate fake users for testing purposes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value as "user" | "admin")}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Default Password</Label>
              <Input
                id="password"
                type="password"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                placeholder="Password123!"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleSeedUsers(5)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  "5 Users"
                )}
              </Button>
              <Button
                onClick={() => handleSeedUsers(10)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  "10 Users"
                )}
              </Button>
              <Button
                onClick={() => handleSeedUsers(25)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  "25 Users"
                )}
              </Button>
              <Button
                onClick={() => handleSeedUsers(50)}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? (
                  <IconLoader2 className="size-4 animate-spin" />
                ) : (
                  "50 Users"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future debug tools */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>Database Tools</CardTitle>
            <CardDescription>
              Coming soon: Reset, backup, and restore tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              More debugging tools will be added here
            </p>
          </CardContent>
        </Card>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle>API Testing</CardTitle>
            <CardDescription>
              Coming soon: Test API endpoints and webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              More debugging tools will be added here
            </p>
          </CardContent>
        </Card>
      </div>

    </>
  )
}

