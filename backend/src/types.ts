import {
  type SelectCard,
  type SelectComunication,
  type SelectDraftedQuest,
  type SelectGame,
  type SelectLobby,
  type SelectPlayer,
  type SelectQuest,
  type SelectTurn,
  type SelectUser,
} from "./drizzle/schema.js";

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type Communication = Pick<SelectComunication, "cardId" | "type"> & {
  playerId: SelectPlayer["id"];
  cardValue: SelectCard["value"];
  cardColor: SelectCard["color"];
};
export type Turn = {
  card: SelectCard;
  quests: Array<Pick<SelectDraftedQuest, "questId" | "isSuccess">>;
  playerId: SelectPlayer["id"];
  turnId: SelectTurn["id"];
};
export type Card = SelectCard & { playerId: SelectPlayer["id"] };
export type Quest = Pick<SelectDraftedQuest, "playerId" | "isSuccess"> & {
  questId: SelectQuest["id"];
  draftedQuestId: SelectDraftedQuest["id"];
};
export type User = Pick<SelectUser, "name"> & { userId: SelectUser["id"] };
export type Player = Pick<SelectPlayer, "number" | "userId"> & {
  playerId: SelectPlayer["id"];
  isActivePlayer?: boolean;
};
export type CardCount = Record<SelectPlayer["id"], number>;

export type GameState = {
  captainsPlayerId: number;
  questToBeDraftedCount: number;
  players: Player[];
  users: User[];
  quests: Quest[];
  turns: Turn[];
  cards: Card[];
  communications: Communication[];
  cardCount: CardCount;
  lobbyId: SelectLobby["id"];
  gameId?: SelectGame["id"] | undefined;
};
