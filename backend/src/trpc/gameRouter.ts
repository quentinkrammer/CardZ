import { z } from "zod";
import { publicProcedure, t } from "./trpc.js";

export const gameRouter = t.router({
  test: publicProcedure.input(z.string()).query((opts) => {
    return { input: opts.input, context: opts.ctx };
  }),
});
