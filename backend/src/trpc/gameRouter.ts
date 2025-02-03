import { on } from "node:events";
import { z } from "zod";
import { authedProcedure, ee, t } from "./trpc.js";

export const gameRouter = t.router({
  test: authedProcedure.input(z.string()).query((opts) => {
    return { input: opts.input, context: opts.ctx };
  }),
  onEvent: authedProcedure.subscription(async function* (opts) {
    // listen for new events
    for await (const [data] of on(ee, "gameEvent")) {
      yield data;
    }
  }),
  playCard: authedProcedure.mutation(() => {
    const action = { action: "playCard", card: { color: "blue", number: "1" } };
    ee.emit("gameEvent", action);
    return action;
  }),
});
