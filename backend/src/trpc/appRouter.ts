import { gameRouter } from "./gameRouter.js";
import { lobbyRouter } from "./lobbyRouter.js";
import { t } from "./trpc.js";

export const appRouter = t.router({
  game: gameRouter,
  lobby: lobbyRouter,
});

export type AppRouter = typeof appRouter;
