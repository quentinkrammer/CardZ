import { db } from "../drizzle.js";
import { InsertLobbyToUser, lobbyToUserTable } from "../schema.js";

export async function joinLobby({ lobbyId, userId }: InsertLobbyToUser) {
  const inserted = await db
    .insert(lobbyToUserTable)
    .values({ lobbyId, userId })
    .returning();

  return inserted[0]!;
}
