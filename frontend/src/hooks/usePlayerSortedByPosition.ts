import { useShallow } from "zustand/react/shallow";
import { useLobbyStore } from "./useLobbyStore";
import { useMyUserData } from "./useMyUserData";

export function usePlayerSortedByPosition() {
  const { data: myUserData } = useMyUserData();
  return useLobbyStore(
    useShallow((state) => {
      const players = state.gameState.players.toSorted(
        (player) => player.number,
      );
      const indexOfMe = players.findIndex(
        (player) => player.userId === myUserData?.id,
      );

      return [...players.slice(indexOfMe), ...players.slice(0, indexOfMe)];
    }),
  );
}
