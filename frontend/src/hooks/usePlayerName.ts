import { GameState } from "backend";
import { useLobbyStore } from "./useLobbyStore";

export function usePlayerName(
  playerId: GameState["captainsPlayerId"] | undefined,
) {
  return useLobbyStore((state) => {
    const players = state.gameState.players;
    const users = state.gameState.users;

    const userId = players.find(
      (player) => player.playerId === playerId,
    )?.userId;
    const name = users.find((user) => user.userId === userId)?.name;

    return name ?? "";
  });
}
