import { db } from "../drizzle.js";
import { cardToPlayerTable, InsertCardToPlayer } from "../schema.js";

export async function assignCards(...cardToPlayer: InsertCardToPlayer[]) {
  await db.insert(cardToPlayerTable).values(cardToPlayer);
}
