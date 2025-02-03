import { initTRPC, TRPCError } from "@trpc/server";
import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import EventEmitter from "node:events";
import { z } from "zod";

const userIdSchema = z.object({ userId: z.string() });

export const createContext = ({ req }: CreateHTTPContextOptions) => {
  const { data } = userIdSchema.safeParse(req);
  return { userId: data?.userId };
};
type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
  sse: {
    maxDurationMs: 5 * 60 * 1_000, // 5 minutes
    ping: {
      enabled: true,
      intervalMs: 3_000,
    },
    client: {
      reconnectAfterInactivityMs: 5_000,
    },
  },
});

export const publicProcedure = t.procedure;
export const authedProcedure = t.procedure.use(async function isAuthed(opts) {
  const { ctx } = opts;
  if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
  return opts.next({
    ctx: { user: ctx.userId },
  });
});

export const ee = new EventEmitter();
