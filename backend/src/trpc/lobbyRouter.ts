import { on } from "node:events";
import { z } from "zod";
import { createLobby } from "../drizzle/query/createLobby.js";
import { joinLobby } from "../drizzle/query/joinLobby.js";
import { leaveLobby } from "../drizzle/query/leaveLobby.js";
import { authedProcedure, ee, t } from "./trpc.js";

const subscriptionUrl = (obj: { lobbyId: string; userId: string }) =>
  `lobby/${obj.lobbyId}/user/${obj.userId}`;

export const lobbyRouter = t.router({
  createLobby: authedProcedure.mutation(async () => {
    const lobbyId = await createLobby();

    return { lobbyId };
  }),
  joinLobby: authedProcedure
    .input(z.object({ lobbyId: z.string() }))
    .subscription(async function* ({ ctx: { userId }, input: { lobbyId } }) {
      await joinLobby({ lobbyId, userId });

      for await (const [data] of on(ee, subscriptionUrl({ lobbyId, userId }))) {
        yield data;
      }
    }),
  leaveLobby: authedProcedure
    .input(z.object({ lobbyId: z.string() }))
    .mutation(async ({ input: { lobbyId }, ctx: { userId } }) => {
      await leaveLobby({ lobbyId, userId });
      ee.removeAllListeners(subscriptionUrl({ lobbyId, userId }));
    }),
});
