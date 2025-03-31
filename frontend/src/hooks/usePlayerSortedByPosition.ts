import { useShallow } from "zustand/react/shallow";
import { useLobbyStore } from "./useLobbyStore";
import { useMyUserData } from "./useMyUserData";

export function usePlayerSortedByPosition() {
  const { data: myUserData } = useMyUserData();
  return useLobbyStore(
    useShallow((state) => {
      const players = state.gameState.players;
      const indexOfMe = players.findIndex(
        (player) => player.userId === myUserData?.id,
      );
      if (indexOfMe === 0) return players;
      return [...players.slice(indexOfMe), ...players.slice(0, indexOfMe)];
    }),
  );
}
