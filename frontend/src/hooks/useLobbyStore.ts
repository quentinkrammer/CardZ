import { GameState } from "backend";
import { create } from "zustand";
import { Omit } from "../types";

type Lobby = Omit<GameState, "lobbyId" | "gameId">;
type LobbyStore = {
  gameState: Lobby;
  update: (lobby: Lobby) => void;
};
export const useLobbyStore = create<LobbyStore>((set) => ({
  gameState: { cards: [], quests: [], turns: [], users: [] },
  update: (lobby) => set({ gameState: lobby }),
}));

export function useUsersStore() {
  return useLobbyStore((state) =>
    sortBy(state.gameState.users, "userId").map((user) => user.name),
  );
}

// TODO: create shared utils library
function sortBy<T, U extends keyof T>(list: T[], key: U) {
  return list.toSorted((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    if (aValue < bValue) {
      return -1;
    }
    if (aValue > bValue) {
      return 1;
    }
    return 0;
  });
}
