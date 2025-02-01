import { on } from "node:events";
import { z } from "zod";
import { ee, publicProcedure, t } from "./trpc.js";

export const gameRouter = t.router({
  test: publicProcedure.input(z.string()).query((opts) => {
    return { input: opts.input, context: opts.ctx };
  }),
  onEvent: publicProcedure.subscription(async function* (opts) {
    // listen for new events
    for await (const [data] of on(ee, "add")) {
      yield data;
    }
  }),
});
