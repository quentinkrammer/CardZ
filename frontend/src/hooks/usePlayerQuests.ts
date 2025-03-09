import { GameState } from "backend";
import { useShallow } from "zustand/react/shallow";
import { useLobbyStore } from "./useLobbyStore";

export function usePlayerQuests(playerId: GameState["captainsPlayerId"]) {
  return useLobbyStore(
    useShallow((state) =>
      state.gameState.quests.filter((quest) => quest.playerId === playerId),
    ),
  );
}
