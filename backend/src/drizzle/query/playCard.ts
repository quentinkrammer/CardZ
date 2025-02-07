import { db } from "../drizzle.js";
import { InsertTurn, turnTable } from "../schema.js";

export function playCard(insertIds: Pick<InsertTurn, "cardId" | "gameId">) {
  db.insert(turnTable).values({ ...insertIds });
}
