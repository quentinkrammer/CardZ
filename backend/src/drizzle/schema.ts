import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey(),
  name: text().notNull(),
});
export const userRelations = relations(usersTable, ({ many }) => {
  return { players: many(playerTable), lobbyToUser: many(lobbyToUserTable) };
});

export const lobbyTable = sqliteTable("lobby", {
  id: text()
    .primaryKey()
    .$defaultFn(() => nanoid()),
});
export const lobbyRelations = relations(lobbyTable, ({ many }) => {
  return { games: many(gameTable), lobbyToUser: many(lobbyToUserTable) };
});

export const gameTable = sqliteTable("games", {
  id: int().primaryKey({ autoIncrement: true }),
  lobbyId: int("lobby_id")
    .references(() => lobbyTable.id)
    .notNull(),
});

export const gameRelations = relations(gameTable, ({ many, one }) => {
  return {
    lobby: one(lobbyTable, {
      references: [lobbyTable.id],
      fields: [gameTable.lobbyId],
    }),
    players: many(playerTable),
    turn: many(turnTable),
    draftedQuests: many(draftedQuestTable),
  };
});

export const playerTable = sqliteTable("players", {
  id: int().primaryKey({ autoIncrement: true }),
  number: text().notNull(),
  userId: int("user_id")
    .references(() => usersTable.id)
    .notNull(),
  gameId: int("game_id")
    .references(() => gameTable.id)
    .notNull(),
});
export type SelectPlayer = InferSelectModel<typeof playerTable>;
export type InsertPlayer = InferInsertModel<typeof playerTable>;
export const playerRelations = relations(playerTable, ({ many, one }) => {
  return {
    user: one(usersTable, {
      references: [usersTable.id],
      fields: [playerTable.userId],
    }),
    game: one(gameTable, {
      references: [gameTable.id],
      fields: [playerTable.gameId],
    }),
    draftedQuests: many(draftedQuestTable),
    cardToPlayer: many(cardToPlayerTable),
  };
});

export const questTable = sqliteTable("quests", {
  id: text().primaryKey(),
});
export const questRelations = relations(questTable, ({ many }) => {
  return { draftedQuests: many(draftedQuestTable) };
});

export const cardTable = sqliteTable("cards", {
  id: int().primaryKey({ autoIncrement: true }),
  color: text({ enum: ["red", "blue", "green", "orange", "black"] }).notNull(),
  value: text().notNull(),
});
export type SelectCard = InferSelectModel<typeof cardTable>;
export type InsertCard = InferInsertModel<typeof cardTable>;
export const cardRelations = relations(cardTable, ({ many }) => {
  return {
    cardToPlayer: many(cardToPlayerTable),
    turns: many(turnTable),
    communications: many(communicationTable),
  };
});

export const turnTable = sqliteTable("turns", {
  id: int().primaryKey({ autoIncrement: true }),
  cardId: int("card_id")
    .references(() => cardTable.id)
    .notNull(),
  gameId: int("game_id")
    .references(() => gameTable.id)
    .notNull(),
});
export type SelectTurn = InferSelectModel<typeof turnTable>;
export type InsertTurn = InferInsertModel<typeof turnTable>;
export const turnRelations = relations(turnTable, ({ many, one }) => {
  return {
    card: one(cardTable, {
      references: [cardTable.id],
      fields: [turnTable.cardId],
    }),
    game: one(gameTable, {
      references: [gameTable.id],
      fields: [turnTable.gameId],
    }),
    draftedQuests: many(draftedQuestTable),
    communications: many(communicationTable),
  };
});

export const communicationTable = sqliteTable("communications", {
  id: int().primaryKey({ autoIncrement: true }),
  type: text({ enum: ["lowest", "highest", "single"] }).notNull(),
  index: int({ mode: "number" }).notNull(),
  cardId: int("card_id")
    .references(() => cardTable.id)
    .notNull(),
  turnId: int("turn_id")
    .references(() => turnTable.id)
    .notNull(),
});
export type SelectComunication = InferSelectModel<typeof communicationTable>;
export type InsertCommunication = InferInsertModel<typeof communicationTable>;
export const communicationRelations = relations(
  communicationTable,
  ({ one }) => {
    return {
      card: one(cardTable, {
        references: [cardTable.id],
        fields: [communicationTable.cardId],
      }),
      turn: one(turnTable, {
        references: [turnTable.id],
        fields: [communicationTable.turnId],
      }),
    };
  }
);

export const draftedQuestTable = sqliteTable("draft", {
  id: int().primaryKey({ autoIncrement: true }),
  gameId: int("game_id")
    .references(() => gameTable.id)
    .notNull(),
  questId: int("quest_id")
    .references(() => questTable.id)
    .notNull(),
  // This is dangerously bad. Technically a 'drafted-quest' could be assigned to a player,
  // that does not partake in the game referenced in 'gameId'
  playerId: int("player_id").references(() => playerTable.id),
  turnId: int("turn_id").references(() => turnTable.id),
  isSuccess: int({ mode: "boolean" }),
});
export type SelectQuest = InferSelectModel<typeof draftedQuestTable>;
export type InsertQuest = InferInsertModel<typeof draftedQuestTable>;

export const draftedQuestRelations = relations(draftedQuestTable, ({ one }) => {
  return {
    game: one(gameTable, {
      references: [gameTable.id],
      fields: [draftedQuestTable.gameId],
    }),
    quest: one(questTable, {
      references: [questTable.id],
      fields: [draftedQuestTable.questId],
    }),
    player: one(playerTable, {
      references: [playerTable.id],
      fields: [draftedQuestTable.playerId],
    }),
    turnId: one(turnTable, {
      references: [turnTable.id],
      fields: [draftedQuestTable.turnId],
    }),
  };
});

export const cardToPlayerTable = sqliteTable("card_to_player", {
  id: int().primaryKey({ autoIncrement: true }),
  cardId: int("card_id")
    .references(() => cardTable.id)
    .notNull(),
  playerId: int("player_id")
    .references(() => playerTable.id)
    .notNull(),
});
export const cardToPlayerRelations = relations(cardToPlayerTable, ({ one }) => {
  return {
    player: one(playerTable, {
      references: [playerTable.id],
      fields: [cardToPlayerTable.cardId],
    }),
    card: one(cardTable, {
      references: [cardTable.id],
      fields: [cardToPlayerTable.cardId],
    }),
  };
});

export const lobbyToUserTable = sqliteTable("lobby_to_user", {
  id: int().primaryKey({ autoIncrement: true }),
  lobbyId: int("lobby_id")
    .references(() => lobbyTable.id)
    .notNull(),
  userId: int("user_id")
    .references(() => usersTable.id)
    .notNull(),
});
export const lobbyToUserRelations = relations(lobbyToUserTable, ({ one }) => {
  return {
    user: one(usersTable, {
      references: [usersTable.id],
      fields: [lobbyToUserTable.userId],
    }),
    lobby: one(lobbyTable, {
      references: [lobbyTable.id],
      fields: [lobbyToUserTable.lobbyId],
    }),
  };
});
