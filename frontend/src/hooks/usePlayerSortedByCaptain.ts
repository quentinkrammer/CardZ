import { type GameState } from "backend";
import { useShallow } from "zustand/react/shallow";
import { useLobbyStore } from "./useLobbyStore";

export function usePlayerSortedByCaptain() {
  return useLobbyStore(
    useShallow((state) =>
      sortPlayerByCaptain({
        players: state.gameState.players,
        captainsPlayerId: state.gameState.captainsPlayerId,
      }),
    ),
  );
}

export function sortPlayerByCaptain({
  captainsPlayerId,
  players,
}: Pick<GameState, "players" | "captainsPlayerId">) {
  // const playersSorted = players.toSorted((player) => player.number);

  const indexOfCaptain = players.findIndex(
    (player) => player.playerId === captainsPlayerId,
  );

  return [
    ...players.slice(indexOfCaptain),
    ...players.slice(0, indexOfCaptain),
  ];
}
