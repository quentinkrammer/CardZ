import { db } from "../drizzle.js";
import { InsertLobbyToUser, lobbyToUserTable } from "../schema.js";

export async function joinLobby(...userAndLobbyId: InsertLobbyToUser[]) {
  const inserted = await db
    .insert(lobbyToUserTable)
    .values(userAndLobbyId)
    .returning();

  return inserted;
}
