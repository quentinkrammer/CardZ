import { relations } from "drizzle-orm";
import {
  cardTable,
  cardToPlayerTable,
  communicationTable,
  gameTable,
  playerTable,
  questTable,
  questToPlayerTable,
  questToTurnTable,
  roomTable,
  turnTable,
  usersTable,
} from "./schema.js";

export const userRelations = relations(usersTable, ({ many }) => {
  return { players: many(playerTable) };
});

export const roomRelations = relations(roomTable, ({ many }) => {
  return { games: many(gameTable) };
});

export const gameRelations = relations(gameTable, ({ many, one }) => {
  return {
    room: one(roomTable, {
      references: [roomTable.id],
      fields: [gameTable.roomId],
    }),
    players: many(playerTable),
    turn: many(turnTable),
  };
});

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
    questToPlayer: many(questToPlayerTable),
    cardToPlayer: many(cardToPlayerTable),
  };
});

export const questRelations = relations(questTable, ({ many }) => {
  return { questToPlayer: many(questToPlayerTable) };
});

export const cardRelations = relations(cardTable, ({ many }) => {
  return {
    cardToPlayer: many(cardToPlayerTable),
    turns: many(turnTable),
    communications: many(communicationTable),
  };
});

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
    questToTurnTable: many(questToTurnTable),
  };
});

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

export const questToPlayerRelations = relations(
  questToPlayerTable,
  ({ one }) => {
    return {
      player: one(playerTable, {
        references: [playerTable.id],
        fields: [questToPlayerTable.playerId],
      }),
      quest: one(questTable, {
        references: [questTable.id],
        fields: [questToPlayerTable.questId],
      }),
    };
  }
);

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

export const questToTurnTableRelations = relations(
  questToTurnTable,
  ({ one }) => {
    return {
      quest: one(questTable, {
        references: [questTable.id],
        fields: [questToTurnTable.questId],
      }),
      turn: one(turnTable, {
        references: [turnTable.id],
        fields: [questToTurnTable.turnId],
      }),
    };
  }
);
