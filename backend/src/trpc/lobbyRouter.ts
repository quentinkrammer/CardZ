import { TRPCError } from "@trpc/server";
import { on } from "node:events";
import { z } from "zod";
import { createLobby } from "../drizzle/query/createLobby.js";
import { getLatestGameOfLobby } from "../drizzle/query/getLatestGameOfLobby.js";
import { joinLobby } from "../drizzle/query/joinLobby.js";
import { leaveLobby } from "../drizzle/query/leaveLobby.js";
import { iterateGameStateForEachUser } from "../iterateGameStateForEachUser.js";
import { subscriptionUrl } from "../subscriptionUrl.js";
import { authedProcedure, ee, t } from "./trpc.js";

export const lobbyRouter = t.router({
  createLobby: authedProcedure.mutation(async () => {
    const lobbyId = await createLobby();

    return { lobbyId };
  }),
  joinLobby: authedProcedure
    .input(z.object({ lobbyId: z.string() }))
    .subscription(async function* ({
      ctx: { userId },
      input: { lobbyId },
      signal,
    }) {
      try {
        await joinLobby({ lobbyId, userId });
      } catch (e) {
        const parsedError = z.object({ code: z.string() }).safeParse(e);
        if (
          parsedError.success &&
          parsedError.data.code !== "SQLITE_CONSTRAINT_UNIQUE"
        )
          throw new TRPCError({
            code: "CONFLICT",
            cause: e,
            message:
              "This is not supposed to ever happen. The original Error is inside 'cause' key.",
          });
      }

      const gameState = await getLatestGameOfLobby(lobbyId);
      yield gameState;

      iterateGameStateForEachUser(gameState, (data) => {
        if (data.userId !== userId) ee.emit(data.subUrl, data.game);
      });

      for await (const [data] of on(ee, subscriptionUrl({ lobbyId, userId }), {
        signal,
      })) {
        yield data;
      }
    }),
  leaveLobby: authedProcedure
    .input(z.object({ lobbyId: z.string() }))
    .mutation(async ({ input: { lobbyId }, ctx: { userId } }) => {
      await leaveLobby({ lobbyId, userId });
      const gameState = await getLatestGameOfLobby(lobbyId);

      iterateGameStateForEachUser(gameState, (data) => {
        if (data.userId === userId) return;
        ee.emit(data.subUrl, gameState);
      });
    }),
});
