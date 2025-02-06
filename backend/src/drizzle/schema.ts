import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
});

export const roomTable = sqliteTable("rooms", {
  id: int().primaryKey({ autoIncrement: true }),
});

export const gameTable = sqliteTable("games", {
  id: int().primaryKey({ autoIncrement: true }),
  roomId: int("room_id")
    .references(() => roomTable.id)
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

export const questToPlayerTable = sqliteTable("quest_to_player", {
  id: int().primaryKey({ autoIncrement: true }),
  playerId: int("player_id")
    .references(() => playerTable.id)
    .notNull(),
  questId: int("quest_id")
    .references(() => questTable.id)
    .notNull(),
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

export const questToTurnTable = sqliteTable("quest_to_turn", {
  id: int().primaryKey({ autoIncrement: true }),
  questId: int("quest_id")
    .references(() => questTable.id)
    .notNull(),
  turnId: int("turn_id")
    .references(() => turnTable.id)
    .notNull(),
  isSuccess: int({ mode: "boolean" }).notNull(),
});
