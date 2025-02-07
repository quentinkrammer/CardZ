import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey(),
  name: text().notNull(),
});

export const lobbyTable = sqliteTable("lobby", {
  id: int().primaryKey(),
});

export const gameTable = sqliteTable("games", {
  id: int().primaryKey({ autoIncrement: true }),
  lobbyId: int("lobby_id")
    .references(() => lobbyTable.id)
    .notNull(),
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

export const questTable = sqliteTable("quests", {
  id: text().primaryKey(),
});

export const cardTable = sqliteTable("cards", {
  id: int().primaryKey({ autoIncrement: true }),
  color: text({ enum: ["red", "blue", "greep", "orange", "black"] }).notNull(),
  value: int({ mode: "number" }).notNull(),
});

export const turnTable = sqliteTable("turns", {
  id: int().primaryKey({ autoIncrement: true }),
  index: int({ mode: "number" }).notNull(),
  cardId: int("card_id")
    .references(() => cardTable.id)
    .notNull(),
  gameId: int("game_id")
    .references(() => gameTable.id)
    .notNull(),
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
  isSuccess: int({ mode: "boolean" }).notNull(),
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
