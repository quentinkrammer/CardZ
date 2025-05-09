import { commitSha } from "../lastCommit.js";
import { gameRouter } from "./gameRouter.js";
import { lobbyRouter } from "./lobbyRouter.js";
import { publicProcedure, t } from "./trpc.js";
import { userRouter } from "./userRouter.js";

const debugRouter = t.router({
  getCommit: publicProcedure.query(() => {
    return commitSha ?? "no_backend_sha";
  }),
});

export const appRouter = t.router({
  game: gameRouter,
  lobby: lobbyRouter,
  user: userRouter,
  debug: debugRouter,
});

export type AppRouter = typeof appRouter;
