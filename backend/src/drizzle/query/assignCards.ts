import { db } from "../drizzle.js";
import { cardToPlayerTable, InsertCardToPlayer } from "../schema.js";

export async function assignCards(...cardToPlayer: InsertCardToPlayer[]) {
  db.insert(cardToPlayerTable).values(cardToPlayer);
}
