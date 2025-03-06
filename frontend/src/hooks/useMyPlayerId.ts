import { useLobbyStore } from "./useLobbyStore";
import { useMyUserData } from "./useMyUserData";

export function useMyPlayerId() {
  const { data } = useMyUserData();
  return useLobbyStore(
    (state) =>
      state.gameState.players.find((player) => player.userId === data?.id)
        ?.playerId,
  );
}
