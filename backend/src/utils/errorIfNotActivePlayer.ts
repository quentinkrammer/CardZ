import { TRPCError } from "@trpc/server";
import { SelectUser } from "../drizzle/schema.js";
import { type GameState } from "../types.js";

export function errorIfNotActivePlayer({
  gameState,
  userId,
}: {
  gameState: GameState;
  userId: SelectUser["id"];
}) {
  const activePlayer = gameState.players.find(
    (player) => player.userId === userId
  );
  if (activePlayer?.userId !== userId)
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `The active players User-ID is ${activePlayer?.userId}. Your User-ID is ${userId}`,
    });
}
