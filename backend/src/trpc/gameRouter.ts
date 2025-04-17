import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import isNil from "lodash/isNil.js";
import { z } from "zod";
import { createGame } from "../drizzle/query/createGame.js";
import { getLatestGameOfLobby } from "../drizzle/query/getLatestGameOfLobby.js";
import { playCard } from "../drizzle/query/playCard.js";
import {
  communicationTable,
  draftedQuestTable,
  SelectCard,
} from "../drizzle/schema.js";
import { iterateGameStateForEachUser } from "../iterateGameStateForEachUser.js";
import { errorIfNotActivePlayer } from "../utils/errorIfNotActivePlayer.js";
import { authedProcedure, ee, t } from "./trpc.js";

export const gameRouter = t.router({
  playCard: authedProcedure
    .input(z.object({ cardId: z.number(), lobbyId: z.string() }))
    .mutation(async ({ input: { cardId, lobbyId }, ctx: { userId } }) => {
      const gameState = await getLatestGameOfLobby(lobbyId);
      const gameId = gameState.gameId;
      if (isNil(gameId))
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `No active game found in lobby with ID ${lobbyId}`,
        });
      errorIfNotActivePlayer({ gameState, userId });

      await playCard({ cardId, gameId });
      // TODO write to draftedQuest Table

      const newGaneState = await getLatestGameOfLobby(lobbyId);
      iterateGameStateForEachUser(newGaneState, (data) => {
        ee.emit(data.subUrl, data.secrefiedGame);
      });
    }),
  pickQuest: authedProcedure
    .input(z.object({ questId: z.string(), lobbyId: z.string() }))
    .mutation(async ({ ctx: { db, userId }, input: { lobbyId, questId } }) => {
      const gameState = await getLatestGameOfLobby(lobbyId);
      const gameId = gameState.gameId;
      const playerId = gameState.players.find(
        (player) => player.userId === userId
      )?.playerId;
      if (isNil(gameId))
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `No active game found in lobby with ID ${lobbyId}`,
        });
      if (isNil(playerId))
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `No Player found for user with ID ${userId}`,
        });
      errorIfNotActivePlayer({ gameState, userId });

      await db
        .update(draftedQuestTable)
        .set({ gameId, questId, playerId })
        .where(
          and(
            eq(draftedQuestTable.questId, questId),
            eq(draftedQuestTable.gameId, gameId)
          )
        );

      const newGameState = await getLatestGameOfLobby(lobbyId);
      iterateGameStateForEachUser(newGameState, (data) => {
        ee.emit(data.subUrl, data.secrefiedGame);
      });
    }),
  communicate: authedProcedure
    .input(
      z.object({
        lobbyId: z.string(),
        cardId: z.number(),
        type: z
          .literal("lowest")
          .or(z.literal("highest").or(z.literal("single"))),
      })
    )
    .mutation(async ({ ctx: { db }, input: { cardId, type, lobbyId } }) => {
      const gameState = await getLatestGameOfLobby(lobbyId);
      const gameId = gameState.gameId;

      if (isNil(gameId))
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `No active game found in lobby with ID ${lobbyId}`,
        });

      await db.insert(communicationTable).values({ cardId, gameId, type });

      const newGameState = await getLatestGameOfLobby(lobbyId);
      iterateGameStateForEachUser(newGameState, (data) => {
        ee.emit(data.subUrl, data.secrefiedGame);
      });
    }),
  createGame: authedProcedure
    .input(z.object({ lobbyId: z.string(), numberOfQuests: z.number().gt(0) }))
    .mutation(
      async ({ input: { lobbyId, numberOfQuests }, ctx: { gamePieces } }) => {
        await createGame({ lobbyId, numberOfQuests, gamePieces });
        // TODO: this query in theory should not be needed.
        // the game state can be assembled inside the above createGame function instead
        const gameState = await getLatestGameOfLobby(lobbyId);

        iterateGameStateForEachUser(gameState, (data) => {
          ee.emit(data.subUrl, data.secrefiedGame);
        });
      }
    ),
  getAllCards: authedProcedure.query(
    ({
      ctx: {
        gamePieces: { cards },
      },
    }) => {
      const cardsMappedToId = cards.reduce<
        Record<SelectCard["id"], SelectCard>
      >((prev, curr) => {
        prev[curr.id] = curr;
        return prev;
      }, {});

      return cardsMappedToId;
    }
  ),
});
