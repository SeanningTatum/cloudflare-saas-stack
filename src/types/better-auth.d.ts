import "better-auth";

declare module "better-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    role: "user" | "admin";
    banned?: boolean | null;
    banReason?: string | null;
    banExpires?: number | null;
  }
}
