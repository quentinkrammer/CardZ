import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getLatestGameOfLobby } from "../drizzle/query/getLatestGameOfLobby.js";
import { usersTable } from "../drizzle/schema.js";
import { iterateGameStateForEachUser } from "../iterateGameStateForEachUser.js";
import { authedProcedure, ee, publicProcedure, t } from "./trpc.js";

export const userRouter = t.router({
  foo: publicProcedure.query(() => "bar"),
  setName: authedProcedure
    .input(z.object({ name: z.string(), lobbyId: z.optional(z.string()) }))
    .mutation(async ({ ctx: { userId, db }, input: { name, lobbyId } }) => {
      await db
        .update(usersTable)
        .set({ name })
        .where(eq(usersTable.id, userId));

      if (lobbyId) {
        const game = await getLatestGameOfLobby(lobbyId);
        iterateGameStateForEachUser(game, (data) => {
          ee.emit(data.subUrl, data.secrefiedGame);
        });
      }

      return name;
    }),
  getMyUserData: authedProcedure.query(async ({ ctx: { userId, db } }) => {
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.id, userId),
    });

    if (!user)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `No User with Id ${userId} found.`,
      });

    return user;
  }),
});
