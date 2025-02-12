import { db } from "../drizzle.js";
import { InsertTurn, turnTable } from "../schema.js";

export async function playCard(
  insertIds: Pick<InsertTurn, "cardId" | "gameId">
) {
  await db.insert(turnTable).values({ ...insertIds });
}
