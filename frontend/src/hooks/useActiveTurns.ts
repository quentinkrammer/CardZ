import { useShallow } from "zustand/react/shallow";
import { useLobbyStore } from "./useLobbyStore";

export function useActiveTurns() {
  return useLobbyStore(
    useShallow(({ gameState }) => {
      const turns = gameState.turns;
      const playedCardsCount = turns.length;
      const playerCount = gameState.players.length;

      const activeCardCount = playedCardsCount % playerCount;
      if (!activeCardCount) return [];
      return turns.slice(-1 * activeCardCount);
    }),
  );
}
