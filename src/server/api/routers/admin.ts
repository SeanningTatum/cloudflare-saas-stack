import { z } from "zod";
import { desc } from "drizzle-orm";

import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/trpc";
import { user } from "@/server/db/schema";
import * as adminRepo from "@/server/repositories/admin";
import {
  NotFoundError,
  ValidationError,
  UpdateError,
  DeletionError,
} from "@/models/errors";

export const adminRouter = createTRPCRouter({
  getUsers: adminProcedure
    .input(
      z.object({
        page: z.number().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.headers) {
        throw new Error("Headers not available in context");
      }

      return ctx.db
        .select()
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(input.limit ?? 100)
        .offset(input.page ?? 0);
    }),

  bulkBanUsers: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        reason: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { validUserIds, skippedCount } =
          await adminRepo.filterProtectedUsers(
            ctx.db,
            input.userIds,
            ctx.user.id
          );

        if (validUserIds.length === 0) {
          throw new ValidationError("user", "No valid user IDs provided");
        }

        const bannedCount = await adminRepo.bulkBanUsers(ctx.db, {
          userIds: validUserIds,
          reason: input.reason,
          expiresAt: input.expiresAt,
        });

        return {
          bannedCount,
          skippedCount,
        };
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof UpdateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

  bulkDeleteUsers: adminProcedure
    .input(z.object({ userIds: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { validUserIds, skippedCount } =
          await adminRepo.filterProtectedUsers(
            ctx.db,
            input.userIds,
            ctx.user.id
          );

        if (validUserIds.length === 0) {
          throw new ValidationError("user", "No valid user IDs provided");
        }

        const deletedCount = await adminRepo.bulkDeleteUsers(ctx.db, {
          userIds: validUserIds,
        });

        return {
          deletedCount,
          skippedCount,
        };
      } catch (error) {
        if (error instanceof DeletionError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }

        if (error instanceof ValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
            cause: error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

  bulkUpdateUserRoles: adminProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        role: z.enum(["user", "admin"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { validUserIds, skippedCount } =
          await adminRepo.filterProtectedUsers(
            ctx.db,
            input.userIds,
            ctx.user.id
          );

        if (validUserIds.length === 0) {
          throw new ValidationError("user", "No valid user IDs provided");
        }

        const updatedCount = await adminRepo.bulkUpdateUserRoles(ctx.db, {
          userIds: validUserIds,
          role: input.role,
        });

        return {
          updatedCount,
          skippedCount,
        };
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof UpdateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

  getUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        return await adminRepo.getUser(ctx.db, {
          userId: input.userId,
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof UpdateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        data: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          role: z.enum(["user", "admin"]).optional(),
          banned: z.boolean().optional(),
          banReason: z.string().optional(),
          banExpires: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await adminRepo.updateUser(ctx.db, {
          userId: input.userId,
          currentUserId: ctx.user.id,
          data: input.data,
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof ValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof UpdateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await adminRepo.banUser(ctx.db, {
          userId: input.userId,
          currentUserId: ctx.user.id,
          reason: input.reason,
          expiresAt: input.expiresAt,
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof ValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof UpdateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await adminRepo.unbanUser(ctx.db, {
          userId: input.userId,
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof UpdateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),

  deleteUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        return await adminRepo.deleteUser(ctx.db, {
          userId: input.userId,
          currentUserId: ctx.user.id,
        });
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof ValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
            cause: error,
          });
        }
        if (error instanceof DeletionError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
            cause: error,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
          cause: error,
        });
      }
    }),
});
