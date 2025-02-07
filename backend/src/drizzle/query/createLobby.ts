import { db } from "../drizzle.js";
import { lobbyTable } from "../schema.js";

export async function createLobby() {
  const inserted = await db.insert(lobbyTable).values({}).returning();

  return inserted[0]!.id;
}
