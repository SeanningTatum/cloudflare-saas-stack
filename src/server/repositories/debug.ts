import { UpdateError, ValidationError } from "@/models/errors";
import { faker } from "@faker-js/faker";

interface SeedUsersPayload {
  count: number;
  role?: "user" | "admin";
  password?: string;
}

type SeedUsersResult = Array<{
  id: string;
  email: string;
  name: string;
  role: string;
  shouldBeBanned?: boolean;
  shouldBeEmailVerified?: boolean;
}>;

/**
 * Seeds the database with fake users
 * @param payload - Seeding configuration
 * @returns Result containing created users count and details
 */
export function seedUsers(payload: SeedUsersPayload): SeedUsersResult {
  if (payload.count <= 0) {
    throw new ValidationError("user", "Count must be greater than 0", "count");
  }

  if (payload.count > 1000) {
    throw new ValidationError(
      "user",
      "Cannot seed more than 1000 users at once",
      "count"
    );
  }

  try {
    const role = payload.role ?? "user";
    const seedData: SeedUsersResult = [];

    for (let i = 0; i < payload.count; i++) {
      const userId = generateId();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const name = `${firstName} ${lastName}`;
      const email = faker.internet.email({ firstName, lastName }).toLowerCase();

      // Insert user
      seedData.push({
        id: userId,
        email,
        name,
        role,
        shouldBeBanned: faker.datatype.boolean({ probability: 0.1 }),
        shouldBeEmailVerified: faker.datatype.boolean({ probability: 0.75 }),
      });
    }

    return seedData;
  } catch (error) {
    throw new UpdateError("user", "Failed to seed users", error);
  }
}

/**
 * Generates a unique ID for database records
 * Matches better-auth's ID generation format
 */
function generateId(): string {
  return faker.string.alphanumeric(32);
}
