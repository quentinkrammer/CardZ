import { type GameState } from "backend";
import { useLobbyStore } from "./useLobbyStore";

export function useIsCaptain(
  playerId: GameState["captainsPlayerId"] | undefined,
) {
  return useLobbyStore(
    (state) => state.gameState.captainsPlayerId === playerId,
  );
}
