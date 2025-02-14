import { GameState } from "backend";
import { create } from "zustand";
import { Omit } from "../types";

type Lobby = Omit<GameState, "lobbyId" | "gameId">;
type LobbyStore = {
  current: Lobby;
  update: (lobby: Lobby) => void;
};
export const useLobbyStore = create<LobbyStore>((set) => ({
  current: { cards: [], quests: [], turns: [], users: [] },
  update: (lobby) => set({ current: lobby }),
}));
