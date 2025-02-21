import { z } from "zod";
import { createGame } from "../drizzle/query/createGame.js";
import { getLatestGameOfLobby } from "../drizzle/query/getLatestGameOfLobby.js";
import { iterateGameStateForEachUser } from "../iterateGameStateForEachUser.js";
import { authedProcedure, ee, t } from "./trpc.js";

export const gameRouter = t.router({
  playCard: authedProcedure.mutation(() => {
    const action = { action: "playCard", card: { color: "blue", number: "1" } };
    ee.emit("gameEvent", action);
    return action;
  }),
  createGame: authedProcedure
    .input(z.object({ lobbyId: z.string(), numberOfQuests: z.number().gt(0) }))
    .mutation(
      async ({ input: { lobbyId, numberOfQuests }, ctx: { gamePieces } }) => {
        await createGame({ lobbyId, numberOfQuests, gamePieces });
        // TODO: this query in theory should not be needed.
        // the game state can be asselmbled inside the above createGame function instead
        const gameState = await getLatestGameOfLobby(lobbyId);

        iterateGameStateForEachUser(gameState, (data) => {
          ee.emit(data.subUrl, data.secrefiedGame);
        });
      }
    ),
});
