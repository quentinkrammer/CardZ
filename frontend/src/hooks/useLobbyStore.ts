import { GameState } from "backend";
import { isNull } from "lodash";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type LobbyStore = {
  gameState: GameState;
  update: (lobby: GameState) => void;
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
    lobbyId: "",
    gameId: NaN,
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

export function useGameStatus() {
  return useLobbyStore(({ gameState: { quests } }) => {
    if (quests.some((quest) => isNull(quest.playerId))) return "draft";
    if (quests.some((quest) => quest.isSuccess === false)) return "defeat";
    if (quests.some((quest) => isNull(quest.isSuccess))) return "ongoing";
    if (quests.every((quest) => quest.isSuccess)) return "victory";
    return "defeat";
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
