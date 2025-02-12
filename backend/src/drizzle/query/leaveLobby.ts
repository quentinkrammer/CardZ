import { and, eq } from "drizzle-orm";
import { db } from "../drizzle.js";
import { InsertLobbyToUser, lobbyToUserTable } from "../schema.js";

export async function leaveLobby({ lobbyId, userId }: InsertLobbyToUser) {
  const deleted = await db
    .delete(lobbyToUserTable)
    .where(
      and(
        eq(lobbyToUserTable.lobbyId, lobbyId),
        eq(lobbyToUserTable.userId, userId)
      )
    )
    .returning();
  return deleted[0]!;
}
