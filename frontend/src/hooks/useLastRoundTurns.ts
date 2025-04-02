import { useShallow } from "zustand/react/shallow";
import { useLobbyStore } from "./useLobbyStore";

export function useLastRoundTurns() {
  return useLobbyStore(
    useShallow(({ gameState }) => {
      const playerCount = gameState.players.length;
      if (gameState.turns.length < playerCount) return;

      const turns = gameState.turns;
      const activeTurns = turns.length % playerCount;

      return activeTurns
        ? turns.slice(-(playerCount + activeTurns), -activeTurns)
        : turns.slice(-playerCount);
    }),
  );
}
