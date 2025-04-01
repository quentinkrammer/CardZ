import { GameState } from "backend";
import { isNil, isNull } from "lodash";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { Omit } from "../types";

export type Lobby = Omit<GameState, "lobbyId" | "gameId">;
type LobbyStore = {
  gameState: Lobby;
  update: (lobby: Lobby) => void;
};
export const useLobbyStore = create<LobbyStore>((set) => ({
  gameState: {
    cards: [],
    quests: [],
    turns: [],
    users: [],
    players: [],
    communications: [],
    cardCount: {},
    questToBeDraftedCount: 3,
    captainsPlayerId: NaN,
  },
  update: (lobby) => set({ gameState: lobby }),
}));

export function useUsersStore() {
  return useLobbyStore(
    useShallow((state) => sortBy(state.gameState.users, "userId")),
  );
}

export function useGameIsReadyToBeStarted() {
  return useLobbyStore((state) => {
    const userCount = state.gameState.users.length;
    const questCount = state.gameState.questToBeDraftedCount;
    return userCount >= 3 && userCount <= 4 && questCount >= 1;
  });
}

export function useQuestToBeDraftedCount() {
  return useLobbyStore((state) => state.gameState.questToBeDraftedCount);
}

// todo extract util to move to shared pnpm repo
export function useGameIsOngoing() {
  return useLobbyStore((state) => {
    const quests = state.gameState.quests;

    const someQuestHasFailed = quests.some(
      (quest) => quest.isSuccess === false,
    );
    if (someQuestHasFailed) return false;

    const someQuestIsActive = quests.some((quest) => isNil(quest.isSuccess));

    return quests.length >= 1 && someQuestIsActive;
  });
}

export function useNonDraftedQuests() {
  const quests = useLobbyStore(
    useShallow((state) =>
      state.gameState.quests.filter((quest) => isNull(quest.playerId)),
    ),
  );

  return quests;
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
