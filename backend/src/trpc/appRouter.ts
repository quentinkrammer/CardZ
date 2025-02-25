import { gameRouter } from "./gameRouter.js";
import { lobbyRouter } from "./lobbyRouter.js";
import { t } from "./trpc.js";
import { userRouter } from "./userRouter.js";

export const appRouter = t.router({
  game: gameRouter,
  lobby: lobbyRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
