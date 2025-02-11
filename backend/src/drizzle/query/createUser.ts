import { db } from "../drizzle.js";
import { InsertUser, usersTable } from "../schema.js";

export async function createUser(...user: InsertUser[]) {
  const inserted = await db.insert(usersTable).values(user).returning();

  return inserted[0]!.id;
}
