import { eq, inArray, count, desc } from "drizzle-orm";
import { user } from "@/server/db/schema";
import {
  NotFoundError,
  UpdateError,
  DeletionError,
  ValidationError,
} from "@/models/errors";
import type { TRPCContext } from "@/server/trpc";

type Database = TRPCContext["db"];

interface GetUsersInput {
  page: number;
  limit: number;
}

export async function getUsers(db: Database, input: GetUsersInput) {
  try {
    const offset = input.page * input.limit;

    const [users, totalCountResult] = await Promise.all([
      db
        .select()
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(input.limit)
        .offset(offset),
      db.select({ count: count() }).from(user),
    ]);

    return {
      users,
      total: totalCountResult[0]?.count ?? 0,
      page: input.page,
      limit: input.limit,
      totalPages: Math.ceil((totalCountResult[0]?.count ?? 0) / input.limit),
    };
  } catch (error) {
    throw new UpdateError("user", "Failed to retrieve users", error);
  }
}

export async function filterProtectedUsers(
  db: Database,
  userIds: string[],
  currentUserId: string
): Promise<{ validUserIds: string[]; skippedCount: number }> {
  if (userIds.length === 0) {
    return { validUserIds: [], skippedCount: 0 };
  }

  try {
    const usersToCheck = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(inArray(user.id, userIds));

    const validUserIds = usersToCheck
      .filter((u) => u.role !== "admin" && u.id !== currentUserId)
      .map((u) => u.id);

    return {
      validUserIds,
      skippedCount: userIds.length - validUserIds.length,
    };
  } catch (error) {
    throw new UpdateError("user", "Failed to validate users", error);
  }
}

interface BulkBanUsersInput {
  userIds: string[];
  reason?: string;
  expiresAt?: Date;
}

export async function bulkBanUsers(
  db: Database,
  input: BulkBanUsersInput
): Promise<number> {
  if (input.userIds.length === 0) {
    return 0;
  }

  try {
    await db
      .update(user)
      .set({
        banned: true,
        banReason: input.reason ?? null,
        banExpires: input.expiresAt ?? null,
      })
      .where(inArray(user.id, input.userIds));

    return input.userIds.length;
  } catch (error) {
    throw new UpdateError("user", "Failed to ban users", error);
  }
}

interface BulkDeleteUsersInput {
  userIds: string[];
}

export async function bulkDeleteUsers(
  db: Database,
  input: BulkDeleteUsersInput
): Promise<number> {
  if (input.userIds.length === 0) {
    return 0;
  }

  try {
    await db.delete(user).where(inArray(user.id, input.userIds));

    return input.userIds.length;
  } catch (error) {
    throw new DeletionError("user", "Failed to delete users", error);
  }
}

interface BulkUpdateUserRolesInput {
  userIds: string[];
  role: "user" | "admin";
}

export async function bulkUpdateUserRoles(
  db: Database,
  input: BulkUpdateUserRolesInput
): Promise<number> {
  if (input.userIds.length === 0) {
    return 0;
  }

  try {
    await db
      .update(user)
      .set({ role: input.role })
      .where(inArray(user.id, input.userIds));

    return input.userIds.length;
  } catch (error) {
    throw new UpdateError("user", "Failed to update user roles", error);
  }
}

interface GetUserInput {
  userId: string;
}

export async function getUser(db: Database, input: GetUserInput) {
  try {
    const foundUser = await db
      .select()
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);

    if (foundUser.length === 0) {
      throw new NotFoundError("user", input.userId);
    }

    return foundUser[0];
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new UpdateError("user", "Failed to retrieve user", error);
  }
}

interface UpdateUserInput {
  userId: string;
  currentUserId: string;
  data: {
    name?: string;
    email?: string;
    role?: "user" | "admin";
    banned?: boolean;
    banReason?: string;
    banExpires?: Date;
  };
}

export async function updateUser(db: Database, input: UpdateUserInput) {
  try {
    const targetUser = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);

    if (targetUser.length === 0) {
      throw new NotFoundError("user", input.userId);
    }

    if (
      targetUser[0].role === "admin" ||
      targetUser[0].id === input.currentUserId
    ) {
      throw new ValidationError(
        "user",
        "Cannot update admin users or yourself",
        "userId"
      );
    }

    const updateData: Partial<typeof user.$inferInsert> = {
      name: input.data.name,
      email: input.data.email,
      role: input.data.role,
      banned: input.data.banned,
      banReason: input.data.banReason,
      banExpires: input.data.banExpires,
    };

    await db.update(user).set(updateData).where(eq(user.id, input.userId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new UpdateError("user", "Failed to update user", error);
  }
}

interface BanUserInput {
  userId: string;
  currentUserId: string;
  reason?: string;
  expiresAt?: Date;
}

export async function banUser(db: Database, input: BanUserInput) {
  try {
    const targetUser = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);

    if (targetUser.length === 0) {
      throw new NotFoundError("user", input.userId);
    }

    if (
      targetUser[0].role === "admin" ||
      targetUser[0].id === input.currentUserId
    ) {
      throw new ValidationError(
        "user",
        "Cannot ban admin users or yourself",
        "userId"
      );
    }

    await db
      .update(user)
      .set({
        banned: true,
        banReason: input.reason ?? null,
        banExpires: input.expiresAt ?? null,
      })
      .where(eq(user.id, input.userId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new UpdateError("user", "Failed to ban user", error);
  }
}

interface UnbanUserInput {
  userId: string;
}

export async function unbanUser(db: Database, input: UnbanUserInput) {
  try {
    const targetUser = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);

    if (targetUser.length === 0) {
      throw new NotFoundError("user", input.userId);
    }

    await db
      .update(user)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(user.id, input.userId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new UpdateError("user", "Failed to unban user", error);
  }
}

interface DeleteUserInput {
  userId: string;
  currentUserId: string;
}

export async function deleteUser(db: Database, input: DeleteUserInput) {
  try {
    const targetUser = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, input.userId))
      .limit(1);

    if (targetUser.length === 0) {
      throw new NotFoundError("user", input.userId);
    }

    if (
      targetUser[0].role === "admin" ||
      targetUser[0].id === input.currentUserId
    ) {
      throw new ValidationError(
        "user",
        "Cannot delete admin users or yourself",
        "userId"
      );
    }

    await db.delete(user).where(eq(user.id, input.userId));

    return { success: true };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      throw error;
    }
    throw new DeletionError("user", "Failed to delete user", error);
  }
}
