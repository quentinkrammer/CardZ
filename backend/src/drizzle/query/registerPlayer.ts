import { db } from "../drizzle.js";
import { InsertPlayer, playerTable } from "../schema.js";

export async function registerPlayer(...player: InsertPlayer[]) {
  return db.insert(playerTable).values(player).returning();
}
