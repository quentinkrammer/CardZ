import { gameRouter } from "./gameRouter.js";
import { t } from "./trpc.js";

export const appRouter = t.router({
  game: gameRouter,
});

export type AppRouter = typeof appRouter;
