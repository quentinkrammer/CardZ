import { useShallow } from "zustand/react/shallow";
import { useLobbyStore } from "./useLobbyStore";

export function useActiveTurns() {
  return useLobbyStore(
    useShallow(({ gameState }) => {
      const turns = gameState.turns;
      const playerCount = gameState.players.length;

      const activeTurns = turns.length % playerCount;
      if (!activeTurns) return [];
      return turns.slice(-activeTurns);
    }),
  );
}
