import { useLobbyStore } from "./useLobbyStore";

export function useActivePlayer() {
  return useLobbyStore(({ gameState }) => {
    return gameState.players.find((player) => player.isActivePlayer);
  });
}
