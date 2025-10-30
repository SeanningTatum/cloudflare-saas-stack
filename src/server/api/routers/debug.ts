import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/trpc";
import * as debugRepository from "@/server/repositories/debug";
import * as adminRepository from "@/server/repositories/admin";
import { ValidationError, UpdateError } from "@/models/errors";

export const debugRouter = createTRPCRouter({
  /**
   * Seeds the database with fake users
   */
  seedUsers: adminProcedure
    .input(
      z.object({
        count: z.number().min(1).max(1000).default(10),
        role: z.enum(["user", "admin"]).optional(),
        password: z.string().min(8).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const users = debugRepository.seedUsers({
          count: input.count,
          role: input.role,
          password: input.password,
        });

        const seededUsers = await Promise.all(
          users.map((user) => {
            return ctx.auth.api.signUpEmail({
              body: {
                name: user.name,
                email: user.email,
                password: input.password ?? "Password123!",
              },
            });
          })
        );

        const updatedUsers = await Promise.all(
          seededUsers.map(({ user }, index) => {
            const seedData = users[index];

            return adminRepository.updateUser(ctx.db, {
              userId: user.id,
              currentUserId: ctx.user.id,
              data: {
                verified: seedData?.shouldBeEmailVerified,
                banned: seedData?.shouldBeBanned,
                banReason: seedData?.shouldBeBanned
                  ? "Banned during seeding"
                  : undefined,
                banExpires: seedData?.shouldBeBanned
                  ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
                  : undefined,
              },
            });
          })
        );

        return {
          updatedUsers,
          count: updatedUsers.length,
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
          message: "An unexpected error occurred while seeding users",
          cause: error,
        });
      }
    }),
});
