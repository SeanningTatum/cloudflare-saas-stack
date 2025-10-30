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

  function handleCustomSeed() {
    const count = parseInt(customCount, 10)
    if (isNaN(count) || count < 1 || count > 1000) {
      toast.error("Please enter a valid number between 1 and 1000")
      return
    }
    handleSeedUsers(count)
  }

  const isLoading = seedUsersMutation.isPending

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debug Tools</h1>
          <p className="text-muted-foreground">
            Development tools for testing and debugging
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

            <div className="space-y-2">
              <Label htmlFor="customCount">Custom Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="customCount"
                  type="number"
                  min="1"
                  max="1000"
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value)}
                  placeholder="Enter number"
                />
                <Button
                  onClick={handleCustomSeed}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <IconLoader2 className="size-4 animate-spin" />
                  ) : (
                    "Seed"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum 1000 users per batch
              </p>
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
    </div>
  )
}

