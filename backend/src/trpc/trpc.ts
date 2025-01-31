import { initTRPC, TRPCError } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { z } from "zod";

const userIdSchema = z.object({ userId: z.string() });

export const createContext = ({ req }: CreateHTTPContextOptions) => {
  const { data } = userIdSchema.safeParse(req);
  return { userId: data?.userId };
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create();
export const publicProcedure = t.procedure;
export const authedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return opts.next({
    ctx: { user: ctx.userId },
  });
});
